import {
    Math as _Math,
    Vector3
} from 'three'

const origin = new Vector3();

function Transition( geometry, from, to, duration, camera, cameraFrom, cameraTo ) {
    this.to = to;
    this.from = from;

    this.duration = duration;

    this.progress = 0;

    this.startAt = 0;

    this.playing = false;

    this.resetCamera = cameraFrom && cameraTo;

    this.cameraFrom = cameraFrom;
    this.cameraTo = cameraTo;

    this.geometry = geometry;

    this.start = () => {
        this.playing = true;
        this.startAt = Date.now();
    }

    this.stop = () => {
        this.playing = false;
    }

    this.update = () => {
        if ( !this.playing ) return;

        this.progress = _Math.clamp( ( Date.now() - this.startAt ) / this.duration, 0, 1 );

        this.geometry.vertices.map( ( v, i ) => {
            const v1 = this.from[ i ];
            const v2 = this.to[ i ];

            v.lerpVectors( v1, v2, this.progress );
        } )
        this.geometry.verticesNeedUpdate = true;

        if ( this.resetCamera ) {
            camera.position.lerpVectors( this.cameraFrom, this.cameraTo, this.progress );
            camera.lookAt( origin );
        }

        if ( this.progress === 1 ) {
            this.playing = false;
        }

    }
}

export { Transition }
