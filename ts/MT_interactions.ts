import { FSM } from "./FSM";
import * as transfo from "./transfo";

function multiTouch(element: HTMLElement) : void {
    let pointerId_1 : number, Pt1_coord_element : SVGPoint, Pt1_coord_parent : SVGPoint,
        pointerId_2 : number, Pt2_coord_element : SVGPoint, Pt2_coord_parent : SVGPoint,
        pointerId_3 : number, Pt3_coord_element : SVGPoint, Pt3_coord_parent : SVGPoint,
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
    enum MT_STATES {Inactive, Translating, Rotozooming, Slide}
    let fsm = FSM.parse<MT_STATES>( {
        initialState: MT_STATES.Inactive,
        states: [MT_STATES.Inactive, MT_STATES.Translating, MT_STATES.Rotozooming,  MT_STATES.Slide],
        transitions : [
            { from: MT_STATES.Inactive, to: MT_STATES.Translating,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt : TouchEvent) : boolean => {

                    pointerId_1 = 0;
                    Pt1_coord_parent = transfo.getPoint(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY); //on récupère le point par rapport a l'évènement
                    originalMatrix = transfo.getMatrixFromElement(element); //on récupère la matrice avec l'élément
                    Pt1_coord_element = Pt1_coord_parent.matrixTransform(originalMatrix.inverse()); // On transforme Le Pt_coord_element avec la formule donnée : M x Pt_coord_element = Pt_coord_parent
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

                    Pt1_coord_parent = transfo.getPoint(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY); //on récupère le point correspondant à la position du doigt sur l'écran
                    transfo.drag(element,originalMatrix,Pt1_coord_element,Pt1_coord_parent); //on applique la fonction de drag.
                    return true;
                }
            },
            { from: MT_STATES.Translating,
                to: MT_STATES.Inactive,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {
                    Pt1_coord_element = null; //Pt1 passe a null car nous n'avons plus de doigt sur la surface de l'écran
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
                    pointerId_2 = 1;

                    Pt2_coord_parent = transfo.getPoint(evt.changedTouches.item(0).clientX, evt.changedTouches.item(0).clientY); //le nouvel évènement qui arrive lorsqu'on ajoute un second doigt est le 0 car le premier doigt n'est plus référencé dans la liste evt.changedTouches ici. L'arrivée d'un nouveau doigt correspond a un évènement avec un doigt
                    originalMatrix = transfo.getMatrixFromElement(element); //on récupère la matrice avec l'élément
                    Pt1_coord_element = Pt1_coord_parent.matrixTransform(originalMatrix.inverse()); // On transforme Le Pt_coord_element avec la formule donnée : M x Pt_coord_element = Pt_coord_parent
                    Pt2_coord_element = Pt2_coord_parent.matrixTransform(originalMatrix.inverse()); // On transforme Le Pt_coord_element avec la formule donnée : M x Pt_coord_element = Pt_coord_parent
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

                    if (evt.changedTouches.item(1)!== null) { // nous appliquons le rotorzoom uniquement si l'on a bien les 2 doigts qui sont repérés dans l'évènement
                        Pt1_coord_parent = transfo.getPoint(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY); //doigt 1
                        Pt2_coord_parent = transfo.getPoint(evt.changedTouches.item(1).clientX, evt.changedTouches.item(1).clientY); //doigt 2
                        transfo.rotozoom(element,originalMatrix,Pt1_coord_element,Pt1_coord_parent, Pt2_coord_element,Pt2_coord_parent); // on applique la fonction de rotozoom
                    }

                    return true;
                }
            },
            { from: MT_STATES.Rotozooming,
                to: MT_STATES.Translating,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {
                    const touch = getRelevantDataFromEvent(evt); //correspond au doigt que l'on enlève de la surface du smartphone
                    originalMatrix = transfo.getMatrixFromElement(element);
                    let distance_touch_Pt1 = Math.sqrt((touch.clientX - Pt1_coord_parent.x)*(touch.clientX - Pt1_coord_parent.x) + (touch.clientY - Pt1_coord_parent.y)*(touch.clientY - Pt1_coord_parent.y)); //distance entre le point correspondant au doigt que l'on vient d'enlever de la surface et Pt1_coord_parent
                    let distance_touch_Pt2 = Math.sqrt((touch.clientX - Pt2_coord_parent.x)*(touch.clientX - Pt2_coord_parent.x) + (touch.clientY - Pt2_coord_parent.y)*(touch.clientY - Pt2_coord_parent.y)); //distance entre le point correspondant au doigt que l'on vient d'enlever de la surface et Pt2_coord_parent

                    if(distance_touch_Pt1 < distance_touch_Pt2) { //si la distance entre le point correspondant au doigt que l'on vient d'enlever de la surface et Pt1_coord_parent est plus petite que la distance entre le point correspondant au doigt que l'on vient d'enlever de la surface et Pt2_coord_parent
                        Pt1_coord_element = Pt2_coord_element; //Pt1 devient Pt2
                        Pt1_coord_parent = Pt2_coord_parent;
                        pointerId_1 = pointerId_2;
                        Pt2_coord_element = null; //Pt2 devient null.
                        Pt2_coord_parent = null;
                        pointerId_2 = -1;
                    } else { //Sinon, Pt1 reste Pt1, Pt2 passe a null.
                        Pt2_coord_element = null;
                        Pt2_coord_parent = null;
                        pointerId_2 = -1;
                    }

                    return true;
                }
            },
            { from: MT_STATES.Rotozooming, to: MT_STATES.Slide,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt : TouchEvent) : boolean => {

                    pointerId_3 = 2;

                    Pt3_coord_parent = transfo.getPoint(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY); //on récupère le point par rapport a l'évènement
                    originalMatrix = transfo.getMatrixFromElement(element); //on récupère la matrice avec l'élément
                    Pt3_coord_element = Pt3_coord_parent.matrixTransform(originalMatrix.inverse()); // On transforme Le Pt_coord_element avec la formule donnée : M x Pt_coord_element = Pt_coord_parent

                    console.log("Rotozoom to Slide");
                    console.log(Pt3_coord_parent);
                    return true;
                }
            },
            { from: MT_STATES.Slide, to: MT_STATES.Slide,
                eventTargets: [document],
                eventName: ["touchmove"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();

                    Pt3_coord_parent = transfo.getPoint(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY); //on récupère le point par rapport a l'évènement
                    //if() {
                    //transfo.dragX(element, originalMatrix, Pt3_coord_element, Pt3_coord_parent);}
                    //else if() {
                    //transfo.dragY(element, originalMatrix, Pt3_coord_element, Pt3_coord_parent);}
                    //else {
                    // console.log("Orientation pt1 pt2 non reconnue");}

                    console.log("Slide to Slide");
                    console.log(Pt3_coord_parent);

                    return true;
                }
            },
            { from: MT_STATES.Slide, to: MT_STATES.Rotozooming,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {

                    const touch = getRelevantDataFromEvent(evt); //correspond au doigt que l'on enlève de la surface du smartphone
                    originalMatrix = transfo.getMatrixFromElement(element);
                    let distance_touch_Pt1 = Math.sqrt((touch.clientX - Pt1_coord_parent.x)*(touch.clientX - Pt1_coord_parent.x) + (touch.clientY - Pt1_coord_parent.y)*(touch.clientY - Pt1_coord_parent.y)); //distance entre le point correspondant au doigt que l'on vient d'enlever de la surface et Pt1_coord_parent
                    let distance_touch_Pt2 = Math.sqrt((touch.clientX - Pt2_coord_parent.x)*(touch.clientX - Pt2_coord_parent.x) + (touch.clientY - Pt2_coord_parent.y)*(touch.clientY - Pt2_coord_parent.y)); //distance entre le point correspondant au doigt que l'on vient d'enlever de la surface et Pt2_coord_parent
                    let distance_touch_Pt3 = Math.sqrt((touch.clientX - Pt3_coord_parent.x)*(touch.clientX - Pt3_coord_parent.x) + (touch.clientY - Pt3_coord_parent.y)*(touch.clientY - Pt3_coord_parent.y)); //distance entre le point correspondant au doigt que l'on vient d'enlever de la surface et Pt3_coord_parent

                    if(distance_touch_Pt2 < distance_touch_Pt3) {
                        if (distance_touch_Pt1 < distance_touch_Pt2) { //si la distance entre le point correspondant au doigt que l'on vient d'enlever de la surface et Pt1_coord_parent est plus petite que la distance entre le point correspondant au doigt que l'on vient d'enlever de la surface et Pt2_coord_parent
                            console.log("pt1 removed");

                            Pt1_coord_element = Pt3_coord_element; //Pt1 devient Pt3
                            Pt1_coord_parent = Pt3_coord_parent;
                            pointerId_1 = pointerId_3;
                            Pt3_coord_element = null; //Pt2 devient null.
                            Pt3_coord_parent = null;
                            pointerId_3 = -1;
                        } else { //Sinon, Pt2 devient Pt3
                            console.log("pt2 removed");

                            Pt2_coord_element = Pt3_coord_element; //Pt1 devient Pt3
                            Pt2_coord_parent = Pt3_coord_parent;
                            pointerId_2 = pointerId_3;
                            Pt3_coord_element = null; //Pt2 devient null.
                            Pt3_coord_parent = null;
                            pointerId_3 = -1;
                        }
                    } else {
                        if (distance_touch_Pt1 < distance_touch_Pt3) { //si la distance entre le point correspondant au doigt que l'on vient d'enlever de la surface et Pt1_coord_parent est plus petite que la distance entre le point correspondant au doigt que l'on vient d'enlever de la surface et Pt2_coord_parent
                            console.log("pt1 removed");

                            Pt1_coord_element = Pt3_coord_element; //Pt1 devient Pt3
                            Pt1_coord_parent = Pt3_coord_parent;
                            pointerId_1 = pointerId_3;
                            Pt3_coord_element = null; //Pt2 devient null.
                            Pt3_coord_parent = null;
                            pointerId_3 = -1;
                        } else { //Sinon, Pt3 passe a null.
                            console.log("pt3 removed");

                            Pt3_coord_element = null;
                            Pt3_coord_parent = null;
                            pointerId_3 = -1;
                        }
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
