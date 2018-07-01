const w : number = window.innerWidth, h : number = window.innerHeight, NODES = 5

const safeExecute : Function = (cb : Function) => {
    if (cb) {
        cb()
    }
}
class LinkedRotateLineStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    linkedRotateLine : LinkedRotateLine = new LinkedRotateLine()

    animator : RLAnimator = new RLAnimator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.linkedRotateLine.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedRotateLine.startUpdating(() => {
                this.animator.start (() => {
                    this.render()
                    this.linkedRotateLine.update(() => {
                        this.animator.stop(() => {
                            this.render()
                        })
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedRotateLineStage = new LinkedRotateLineStage()
        stage.render()
        stage.handleTap()
    }
}

class RLState {

    scale : number = 0

    prevScale : number = 0

    dir : number = 0

    update(cb : Function) {
        this.scale += this.dir * 0.1
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            safeExecute(cb)
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            safeExecute(cb)
        }
    }
}

class RLAnimator {

    animated : boolean = false

    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                safeExecute(cb)
            }, 60)
        }
    }

    stop(cb : Function) {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
            safeExecute(cb)
        }
    }
}

class RLNode {

    prev : RLNode

    next : RLNode

    state : RLState = new RLState()

    constructor(private i : number) {
        this.addNeighbor()
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    addNeighbor() {
        if (this.i < NODES - 1) {
            this.next = new RLNode(this.i + 1)
            this.next.prev = this
        }
    }

    getNext(dir : number, cb : Function) : RLNode {
        var curr : RLNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        safeExecute(cb)
        return this
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = (w * 0.8) / (NODES + 1)
        context.save()
        context.translate(0.1 * w + this.i * gap + gap, h / 2)
        context.rotate(Math.PI * this.state.scale)
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(-gap, 0)
        context.stroke()
        context.restore()
    }
}

class LinkedRotateLine {

    curr : RLNode = new RLNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 60
        context.strokeStyle = '#e74c3c'
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            safeExecute(cb)
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
