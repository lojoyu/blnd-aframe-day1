
window.onload = function() {
    let scene = document.querySelector('a-scene');
    var renderer = scene.renderer;
    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.outputEncoding = THREE.sRGBEncoding;
}

// FOR 1.2.0
AFRAME.registerComponent('ao', { 
    init: function () {
        let mesh = this.el.getObject3D('mesh');
        if (mesh) {
            let geometry = mesh.geometry;
            if (geometry) {
                geometry.addAttribute( 'uv2', new THREE.BufferAttribute( geometry.attributes.uv.array, 2 ) );
            }
        }
    }
});

AFRAME.registerComponent("envmap", {
    schema: {
        "src": {
            type: "asset"
        },
    },
    init: function() {
        var renderer = this.el.sceneEl.renderer;
        //renderer.toneMapping = THREE.ACESFilmicToneMapping;
        //renderer.toneMappingExposure = 0.5;
        //renderer.outputEncoding = THREE.sRGBEncoding;
        
        this.el.addEventListener("loaded", this.setupEnv.bind(this));
        this.el.addEventListener("model-loaded", this.setupEnv.bind(this));
    },
    setupEnv: function(e) {
        let mesh = this.el.getObject3D("mesh");
        var renderer = this.el.sceneEl.renderer;
        var targetCube = new THREE.WebGLRenderTargetCube(512, 512);
        var texture = new THREE.TextureLoader().load(this.data.src,
            function() {
                var cubeTex = targetCube.fromEquirectangularTexture(renderer, texture);
                if (mesh) {
                    mesh.traverse(function(el) {
                        if (el.material) {
                            el.material.envMap = cubeTex.texture;
                            el.material.envMap.intensity = 1;
                            el.material.needsUpdate = true;
                        }
                    });
                }
            }
        );
    }
});

AFRAME.registerComponent("foo", {
    schema: {
        "envMap": {
            type: "asset"
        },
    },
    init: function() {
        var targetCube = new THREE.WebGLRenderTargetCube(512, 512);
        var renderer = this.el.sceneEl.renderer;

        this.el.addEventListener("model-loaded", e => {
            let mesh = this.el.getObject3D("mesh");
            
            var texture = new THREE.TextureLoader().load(
            this.data.envMap,
            function() {
                var cubeTex = targetCube.fromEquirectangularTexture(renderer, texture);
                mesh.traverse(function(el) {
                    console.log(el);
                    if (el.material) {
                        el.material.envMap = cubeTex.texture;
                        el.material.envMap.intensity = 1;
                        el.material.needsUpdate = true;
                    }
                });
                //renderer.toneMapping = THREE.ACESFilmicToneMapping;
                //renderer.outputEncoding = THREE.sRGBEncoding;
            }
            );
        });
    }
});


AFRAME.registerComponent("cubecamera", {
    init: function() {
        var targetCube = new THREE.WebGLRenderTargetCube(512, 512);
        var renderer = this.el.sceneEl.renderer;
        const cubeCamera = new THREE.CubeCamera( 1, 500, targetCube );
        this.el.sceneEl.object3D.add( cubeCamera );

        this.el.addEventListener("model-loaded", e => {
            this.el.visible = false;
            cubeCamera.position.copy( this.el.object3D.position);
            cubeCamera.update( renderer, this.el.sceneEl.object3D );
            this.el.visible = true;
            let mesh = this.el.getObject3D("mesh");

            mesh.traverse(function(el) {
                if (el.material) {
                    //el.material.envMap = targetCube.texture;
                    //el.material.envMap.intensity = 1;
                    //el.material.needsUpdate = true;
                }
            });
        });
        this.cubeCamera = cubeCamera;
    },
    update: function() {
        var renderer = this.el.sceneEl.renderer;
        this.el.visible = false;
        this.cubeCamera.position.copy( this.el.object3D.position);
        this.cubeCamera.update( renderer, this.el.sceneEl.object3D );
        this.el.visible = true;
    }
});
