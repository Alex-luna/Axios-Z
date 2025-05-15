// Initial images
const INITIAL_IMAGES = [
    'https://images.unsplash.com/photo-1747002723627-64bd22456217?q=80&w=1920',
    'https://images.unsplash.com/photo-1746311585296-f91039c70a8f?q=80&w=1920',
    'https://images.unsplash.com/photo-1747109644717-9e867b41c987?q=80&w=1920',
    'https://images.unsplash.com/photo-1526510747491-58f928ec870f?q=80&w=1920',
    'https://images.unsplash.com/photo-1622551445161-bab5bcb90ff4?q=80&w=1920',
    'https://images.unsplash.com/photo-1495924979005-79104481a52f?q=80&w=1920',
    'https://images.unsplash.com/photo-1498551172505-8ee7ad69f235?q=80&w=1920',
    'https://images.unsplash.com/photo-1495707800306-e240c5a0d65f?q=80&w=1920',
    'https://images.unsplash.com/photo-1587910234573-d6fc84743bc8?q=80&w=1920',
    'https://images.unsplash.com/photo-1501621667575-af81f1f0bacc?q=80&w=1920',
    'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=1920',
];

const DEFAULTS = {
    speed: 2,
    spacing: 1000,
    spacingX: 0, // padrão agora é 0
    angleX: 10,
    angleY: 10,
    angleZ: 0,
    scale: 1,
    cameraPosition: 0
};

class DepthGallery {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('scene'),
            antialias: true
        });
        
        this.images = [];
        this.isLooping = true;
        this.spacing = DEFAULTS.spacing;
        this.spacingX = DEFAULTS.spacingX;
        this.cameraPosition = DEFAULTS.cameraPosition;
        this.maxDepth = -4000;
        this.speed = DEFAULTS.speed;
        this.angleX = DEFAULTS.angleX;
        this.angleY = DEFAULTS.angleY;
        this.angleZ = DEFAULTS.angleZ;
        this.scale = DEFAULTS.scale;
        this.isPaused = false;
        this._shouldAnimate = true;
        this.isDragging = false;
        this.lastMouseY = 0;
        this.lastMouseX = 0;
        this.cameraY = 0;
        this.cameraX = 0;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.position.z = 0;
        this.scene.background = new THREE.Color(document.getElementById('backgroundColor').value);

        this.images = [];
        this.imageZPositions = [];
        INITIAL_IMAGES.forEach((url, index) => {
            this.addImage(url, index * -this.spacing, index * this.spacingX);
            this.imageZPositions.push(index * -this.spacing);
        });
        this.cameraPosition = 0;
        this.maxDepth = -((INITIAL_IMAGES.length - 1) * this.spacing);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupEventListeners() {
        const sidePanel = document.getElementById('sidePanel');
        const togglePanelBtn = document.getElementById('togglePanel');
        togglePanelBtn.addEventListener('click', () => {
            sidePanel.classList.toggle('hidden');
        });

        document.getElementById('addImage').addEventListener('click', () => {
            const url = document.getElementById('imageUrl').value;
            if (url) {
                this.addImage(url, this.images.length * -this.spacing, this.images.length * this.spacingX);
                this.imageZPositions.push(this.images.length * -this.spacing);
                this.maxDepth = -((this.images.length - 1) * this.spacing);
                document.getElementById('imageUrl').value = '';
            }
        });

        document.getElementById('backgroundColor').addEventListener('input', (e) => {
            this.scene.background = new THREE.Color(e.target.value);
        });

        document.getElementById('loopToggle').addEventListener('change', (e) => {
            this.isLooping = e.target.checked;
        });

        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            speedValue.textContent = this.speed;
        });

        // Espaçamento Z
        const spacingSlider = document.getElementById('spacingSlider');
        const spacingValue = document.getElementById('spacingValue');
        spacingSlider.addEventListener('input', (e) => {
            this.spacing = parseInt(e.target.value);
            spacingValue.textContent = this.spacing;
            this.images.forEach((mesh, i) => {
                mesh.position.z = i * -this.spacing;
            });
            this.maxDepth = -((this.images.length - 1) * this.spacing);
        });
        // Espaçamento X
        const spacingXSlider = document.getElementById('spacingXSlider');
        const spacingXValue = document.getElementById('spacingXValue');
        spacingXSlider.addEventListener('input', (e) => {
            this.spacingX = parseInt(e.target.value);
            spacingXValue.textContent = this.spacingX;
            this.images.forEach((mesh, i) => {
                mesh.position.x = (Math.random() - 0.5) * 1000 + i * this.spacingX;
            });
        });

        // Sliders de rotação X, Y, Z
        const angleXSlider = document.getElementById('angleXSlider');
        const angleXValue = document.getElementById('angleXValue');
        angleXSlider.addEventListener('input', (e) => {
            this.angleX = parseInt(e.target.value);
            angleXValue.textContent = this.angleX + '°';
            this.applyAnglesToImages();
        });
        const angleYSlider = document.getElementById('angleYSlider');
        const angleYValue = document.getElementById('angleYValue');
        angleYSlider.addEventListener('input', (e) => {
            this.angleY = parseInt(e.target.value);
            angleYValue.textContent = this.angleY + '°';
            this.applyAnglesToImages();
        });
        const angleZSlider = document.getElementById('angleZSlider');
        const angleZValue = document.getElementById('angleZValue');
        angleZSlider.addEventListener('input', (e) => {
            this.angleZ = parseInt(e.target.value);
            angleZValue.textContent = this.angleZ + '°';
            this.applyAnglesToImages();
        });

        const scaleSlider = document.getElementById('scaleSlider');
        const scaleValue = document.getElementById('scaleValue');
        scaleSlider.addEventListener('input', (e) => {
            this.scale = parseFloat(e.target.value);
            scaleValue.textContent = this.scale.toFixed(2) + 'x';
            this.applyScaleToImages();
        });

        document.getElementById('randomizeAngles').addEventListener('click', () => {
            this.randomizeAngles();
        });

        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                document.body.classList.add('ctrl-pressed');
            }
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
            }
            if (e.key === 'c' || e.key === 'C') {
                sidePanel.classList.toggle('hidden');
            }
            if (e.key === 'r' || e.key === 'R') {
                this.resetConfig();
            }
            if (e.key === 'a' || e.key === 'A') {
                this.speed = Math.max(0.5, this.speed - 0.2);
                speedSlider.value = this.speed;
                speedValue.textContent = this.speed;
            }
            if (e.key === 's' || e.key === 'S') {
                this.speed = Math.min(10, this.speed + 0.2);
                speedSlider.value = this.speed;
                speedValue.textContent = this.speed;
            }
            if (e.key === 'x' || e.key === 'X') {
                this.cameraPosition = 0;
            }
        });
        document.addEventListener('keyup', (e) => {
            if (!e.altKey) {
                document.body.classList.remove('ctrl-pressed');
            }
        });

        // --- Controle de câmera X e Y com mouse ---
        const canvas = this.renderer.domElement;
        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseY = e.clientY;
            this.lastMouseX = e.clientX;
        });
        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaY = e.clientY - this.lastMouseY;
                const deltaX = e.clientX - this.lastMouseX;
                this.cameraY -= deltaY * 2; // Sensibilidade Y
                this.cameraX += deltaX * 2; // Sensibilidade X
                this.lastMouseY = e.clientY;
                this.lastMouseX = e.clientX;
            }
        });
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        // --- Fim do controle de câmera X e Y ---

        // --- Controle de visibilidade do cursor ---
        const updateCursor = () => {
            if (sidePanel.classList.contains('hidden')) {
                canvas.style.cursor = 'none';
            } else {
                canvas.style.cursor = 'default';
            }
        };
        // Atualiza ao abrir/fechar o painel
        document.getElementById('togglePanel').addEventListener('click', updateCursor);
        // Atualiza ao carregar
        updateCursor();
        // --- Fim do controle de visibilidade do cursor ---
    }

    addImage(url, zPosition = null, xPosition = null) {
        const loader = new THREE.TextureLoader();
        loader.load(
            url,
            (texture) => {
                const aspectRatio = texture.image.width / texture.image.height;
                const width = 800;
                const height = width / aspectRatio;

                const geometry = new THREE.PlaneGeometry(width, height);
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0
                });

                const mesh = new THREE.Mesh(geometry, material);
                // Espaçamento X e Z
                const x = xPosition !== null ? xPosition : (Math.random() - 0.5) * 1000 + this.images.length * this.spacingX;
                const y = (Math.random() - 0.5) * 200;
                const z = zPosition ?? this.images.length * -this.spacing;

                mesh.position.set(x, y, z);
                // Rotação fixa pelos sliders
                mesh.rotation.x = THREE.MathUtils.degToRad(this.angleX);
                mesh.rotation.y = THREE.MathUtils.degToRad(this.angleY);
                mesh.rotation.z = THREE.MathUtils.degToRad(this.angleZ);
                mesh.scale.set(this.scale, this.scale, 1);

                this.scene.add(mesh);
                this.images.push(mesh);

                gsap.to(material, {
                    opacity: 1,
                    duration: 1,
                    ease: 'power2.out'
                });
                gsap.from(mesh.scale, {
                    x: 0.8 * this.scale,
                    y: 0.8 * this.scale,
                    duration: 1,
                    ease: 'power2.out'
                });

                this.updateImageList();
            },
            undefined,
            (err) => {
                alert('Erro ao carregar imagem!');
            }
        );
    }

    removeImage(index) {
        const mesh = this.images[index];
        gsap.to(mesh.material, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                this.scene.remove(mesh);
                this.images.splice(index, 1);
                this.maxDepth = -((this.images.length - 1) * this.spacing);
                this.updateImageList();
            }
        });
    }

    updateImageList() {
        const imageList = document.getElementById('imageList');
        imageList.innerHTML = '';
        this.images.forEach((mesh, index) => {
            const item = document.createElement('div');
            item.className = 'image-item';
            item.innerHTML = `
                <span>Imagem ${index + 1}</span>
                <button class="remove-image" data-index="${index}">🗑️ Remover</button>
            `;
            imageList.appendChild(item);
        });
        document.querySelectorAll('.remove-image').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeImage(index);
            });
        });
    }

    applyAnglesToImages() {
        // Aplica rotação fixa dos sliders para todas as imagens
        this.images.forEach(mesh => {
            mesh.rotation.x = THREE.MathUtils.degToRad(this.angleX);
            mesh.rotation.y = THREE.MathUtils.degToRad(this.angleY);
            mesh.rotation.z = THREE.MathUtils.degToRad(this.angleZ);
        });
    }

    randomizeAngles() {
        this.images.forEach(mesh => {
            mesh.rotation.x = THREE.MathUtils.degToRad(Math.random() * 360);
            mesh.rotation.y = THREE.MathUtils.degToRad(Math.random() * 360);
            mesh.rotation.z = THREE.MathUtils.degToRad(Math.random() * 360);
        });
    }

    applyScaleToImages() {
        this.images.forEach(mesh => {
            mesh.scale.set(this.scale, this.scale, 1);
        });
    }

    resetConfig() {
        // Resetar sliders e valores
        this.speed = DEFAULTS.speed;
        this.spacing = DEFAULTS.spacing;
        this.spacingX = DEFAULTS.spacingX;
        this.angleX = DEFAULTS.angleX;
        this.angleY = DEFAULTS.angleY;
        this.angleZ = DEFAULTS.angleZ;
        this.scale = DEFAULTS.scale;
        this.cameraPosition = DEFAULTS.cameraPosition;
        document.getElementById('speedSlider').value = this.speed;
        document.getElementById('speedValue').textContent = this.speed;
        document.getElementById('spacingSlider').value = this.spacing;
        document.getElementById('spacingValue').textContent = this.spacing;
        document.getElementById('spacingXSlider').value = this.spacingX;
        document.getElementById('spacingXValue').textContent = this.spacingX;
        document.getElementById('angleXSlider').value = this.angleX;
        document.getElementById('angleXValue').textContent = this.angleX + '°';
        document.getElementById('angleYSlider').value = this.angleY;
        document.getElementById('angleYValue').textContent = this.angleY + '°';
        document.getElementById('angleZSlider').value = this.angleZ;
        document.getElementById('angleZValue').textContent = this.angleZ + '°';
        document.getElementById('scaleSlider').value = this.scale;
        document.getElementById('scaleValue').textContent = this.scale.toFixed(2) + 'x';
        this.applyAnglesToImages();
        this.applyScaleToImages();
        this.images.forEach((mesh, i) => {
            mesh.position.z = i * -this.spacing;
            mesh.position.x = (Math.random() - 0.5) * 1000 + i * this.spacingX;
        });
        this.maxDepth = -((this.images.length - 1) * this.spacing);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        if (this.isPaused) {
            pauseBtn.classList.add('paused');
            pauseBtn.textContent = '▶️ Continuar';
        } else {
            pauseBtn.classList.remove('paused');
            pauseBtn.textContent = '⏸️ Pausar';
        }
    }

    animate() {
        if (!this.isPaused) {
            this.cameraPosition -= this.speed;
            if (this.cameraPosition <= this.maxDepth) {
                if (this.isLooping) {
                    this.cameraPosition = 0;
                } else {
                    this.cameraPosition = this.maxDepth;
                }
            }
            this.camera.position.z = this.cameraPosition;
        }
        this.camera.position.y = this.cameraY;
        this.camera.position.x = this.cameraX;
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate.bind(this));
    }
}

new DepthGallery();
