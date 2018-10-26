let re_matrix = /^matrix\((.*), (.*), (.*), (.*), (.*), (.*)\)$/;

let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
let idM	= svg.createSVGMatrix();
idM.a=1; idM.b=0; idM.c=0; idM.d=1; idM.e=0; idM.f=0;

//______________________________________________________________________________________________________________________
export let setMatrixCoordToElement =    ( element: HTMLElement
                                        , a : number
                                        , b : number
                                        , c : number
                                        , d : number
                                        , e : number
                                        , f : number
                                        ) => {
    element.style.transform = "matrix(" + a +"," + b +"," + c +"," + d +"," + e +"," + f +")";
};

//______________________________________________________________________________________________________________________
export let setMatrixToElement = (element: HTMLElement, M: SVGMatrix) => {
    setMatrixCoordToElement(element, M.a, M.b, M.c, M.d, M.e, M.f);
};

//______________________________________________________________________________________________________________________
export let getMatrixFromString = (str: string) : SVGMatrix => {
    let res		= re_matrix.exec( str )
      , matrix	= svg.createSVGMatrix()
      ;
    matrix.a = parseFloat(res[1]) || 1;
    matrix.b = parseFloat(res[2]) || 0;
    matrix.c = parseFloat(res[3]) || 0;
    matrix.d = parseFloat(res[4]) || 1;
    matrix.e = parseFloat(res[5]) || 0;
    matrix.f = parseFloat(res[6]) || 0;

    return matrix;
};

//______________________________________________________________________________________________________________________
export let getPoint = (x: number, y: number) : SVGPoint => {
    let point = svg.createSVGPoint();
    point.x = x || 0;
    point.y = y || 0;
    return point;
};

//______________________________________________________________________________________________________________________
export let getMatrixFromElement = (element: Element) : SVGMatrix => {
	return getMatrixFromString( window.getComputedStyle(element).transform || "matrix(1,1,1,1,1,1)" );
};

//______________________________________________________________________________________________________________________
export let drag =       ( element               : HTMLElement
                        , originalMatrix        : SVGMatrix
                        , Pt_coord_element      : SVGPoint
                        , Pt_coord_parent       : SVGPoint
                        ) => {
	// TO BE DONE
    originalMatrix.e = Pt_coord_parent.x - (originalMatrix.a*Pt_coord_element.x) - (originalMatrix.c*Pt_coord_element.y);
    originalMatrix.f = Pt_coord_parent.y - (originalMatrix.b*Pt_coord_element.x) - (originalMatrix.d*Pt_coord_element.y);
    setMatrixToElement(element, originalMatrix);
};

//______________________________________________________________________________________________________________________
export let rotozoom =   ( element           : HTMLElement
                        , originalMatrix    : SVGMatrix
                        , Pt1_coord_element : SVGPoint
                        , Pt1_coord_parent  : SVGPoint
                        , Pt2_coord_element : SVGPoint
                        , Pt2_coord_parent  : SVGPoint
                        ) => {
	// TO BE DONE
    let P1 = Pt1_coord_element;
    let P2 = Pt2_coord_element;
    let P1p = Pt1_coord_parent;
    let P2p = Pt2_coord_parent;

    let dx = P2.x  - P1.x;
    let dy  = P2.y  - P1.y;
    let dxp = P2p.x - P1p.x;
    let dyp = P2p.y - P1p.y;

    let c,s,e,f;

    if (dx===0 && dy===0) {
       //on abandonne
    } else {
        if (dx===0 && dy !== 0) {
            s = -dxp/dy;
            c= dyp/dy;
        } else if (dx!==0 && dy === 0) {
            s= dyp/dx;
            c=dxp/dx;
        } else if (dx!==0 && dy !== 0) {
            s = (dyp/dy - dxp/dx) / (dy/dx + dx/dy);
            c =(dyp - s*dx)/dy;
        }

        e = P1p.x - c*P1.x + s*P1.y;
        f = P1p.y - s*P1.x - c*P1.y;
        setMatrixCoordToElement(element,c,s,-s,c,e,f);
    }
};

