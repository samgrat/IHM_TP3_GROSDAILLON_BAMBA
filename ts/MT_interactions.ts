import { FSM } from "./FSM";
import * as transfo from "./transfo";

function multiTouch(element: HTMLElement) : void {
    let pointerId_1 : number, Pt1_coord_element : SVGPoint, Pt1_coord_parent : SVGPoint,
        pointerId_2 : number, Pt2_coord_element : SVGPoint, Pt2_coord_parent : SVGPoint,
        originalMatrix : SVGMatrix,
        getRelevantDataFromEvent = (evt : TouchEvent) : Touch => {
            for(let i=0; i<evt.changedTouches.length; i++) {
                let touch = evt.changedTouches.item(i);
                if(touch.identifier === pointerId_1 || touch.identifier === pointerId_2) {
                    return touch;
                }
            }
            return null;
        };
    enum MT_STATES {Inactive, Translating, Rotozooming}
    let fsm = FSM.parse<MT_STATES>( {
        initialState: MT_STATES.Inactive,
        states: [MT_STATES.Inactive, MT_STATES.Translating, MT_STATES.Rotozooming],
        transitions : [
            { from: MT_STATES.Inactive, to: MT_STATES.Translating,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt : TouchEvent) : boolean => {
                    let touch = getRelevantDataFromEvent(evt);
                    pointerId_1 = touch.identifier;

                    Pt1_coord_parent = transfo.getPoint(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);

                    originalMatrix = transfo.getMatrixFromElement(element);

                    Pt1_coord_element = Pt1_coord_parent.matrixTransform(originalMatrix.inverse());

                    console.log("Hello World !" + Pt1_coord_element);
                    return true;
                }
            },
            { from: MT_STATES.Translating, to: MT_STATES.Translating,
                eventTargets: [document],
                eventName: ["touchmove"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();

                    Pt1_coord_parent = transfo.getPoint(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);

                    transfo.drag(element,originalMatrix,Pt1_coord_element,Pt1_coord_parent);

                    console.log("On translate " + Pt1_coord_parent.x);
                    return true;
                }
            },
            { from: MT_STATES.Translating,
                to: MT_STATES.Inactive,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {
                    Pt1_coord_element = null;
                    Pt1_coord_parent = null;
                    pointerId_1 = -1;
                    return true;
                }
            },
            { from: MT_STATES.Translating, to: MT_STATES.Rotozooming,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt : TouchEvent) : boolean => {
                    let touch = getRelevantDataFromEvent(evt);
                    pointerId_2 = touch.identifier;

                    Pt1_coord_parent = transfo.getPoint(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
                    Pt2_coord_parent = transfo.getPoint(evt.changedTouches[1].clientX, evt.changedTouches[1].clientY);

                    originalMatrix = transfo.getMatrixFromElement(element);

                    Pt2_coord_element = Pt1_coord_parent.matrixTransform(originalMatrix.inverse());
                    Pt1_coord_element = Pt2_coord_parent.matrixTransform(originalMatrix.inverse());
                    return true;
                }
            },
            { from: MT_STATES.Rotozooming, to: MT_STATES.Rotozooming,
                eventTargets: [document],
                eventName: ["touchmove"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();

                    Pt1_coord_parent = transfo.getPoint(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
                    Pt2_coord_parent = transfo.getPoint(evt.changedTouches[1].clientX, evt.changedTouches[1].clientY);

                    transfo.rotozoom(element,originalMatrix,Pt1_coord_element,Pt1_coord_parent, Pt2_coord_element,Pt2_coord_parent);
                    return true;
                }
            },
            { from: MT_STATES.Rotozooming,
                to: MT_STATES.Translating,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {
                    const touch = getRelevantDataFromEvent(evt);
                    // On verifie quel pointeur est toujours sur l'ecran
                    if(touch.identifier === pointerId_2) {
                        // si c'est le pointeur 2 on le "renomme" en pointeur 1
                        Pt1_coord_element = Pt2_coord_element;
                        Pt1_coord_parent = Pt2_coord_parent;
                        pointerId_1 = pointerId_2;
                        Pt2_coord_element = null;
                        Pt2_coord_parent = null;
                        pointerId_2 = -1;
                    } else if(touch.identifier === pointerId_1) {
                        Pt2_coord_element = null;
                        Pt2_coord_parent = null;
                        pointerId_2 = -1;
                    } else {
                        console.error("Erreur pointeur inatendu");
                    }
                    return true;
                }
            }
        ]
    } );
    fsm.start();
}

//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
function isString(s : any) : boolean {
    return typeof(s) === "string" || s instanceof String;
}

export let $ = (sel : string | Element | Element[]) : void => {
    let L : Element[] = [];
    if( isString(sel) ) {
        L = Array.from( document.querySelectorAll(<string>sel) );
    } else if(sel instanceof Element) {
        L.push( sel );
    } else if(sel instanceof Array) {
        L = sel;
    }
    L.forEach( multiTouch );
};
