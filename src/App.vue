<template>
    <div id="app">
        <div class="modal modal--danger" v-if="disconnected">
            <div class="modal__inner">
                <h2>Wichtig!</h2>
                <p>Die Verbindung wurde geschlossen. Die Stromversorgung der Motoren muss abgeschaltet werden!</p>
            </div>
        </div>
        <div class="modal" v-if="!connected">
            <div class="modal__inner">
                <h2>Warten auf Verbindung...</h2>
            </div>
        </div>
        <table v-for="motor in motors" class="motor" @click="sel[motor]=!sel[motor]">
            <tr><th colspan="2">Motor {{motor}}</th></tr>
            <tr><th>Position</th><td>{{pos[motor]}}</td></tr>
            <tr><th>Target</th><td>{{tar[motor]}}</td></tr>
            <tr><th>Select</th><td><input type="checkbox" v-model.number="sel[motor]"></td></tr>
            <tr>
                <td><button @click.stop="moveUp(motor)">&uarr;</button></td>
                <td><button @click.stop="moveDown(motor)">&darr;</button></td>
            </tr>
        </table>
        <br>
        <table class="settings">
            <tr><th colspan="2">Global</th></tr>
            <tr>
                <th>Steps</th>
                <td><input type="number" v-model="steps"></td>
            </tr>
            <tr>
                <td><input type="number" v-model="target"></td>
                <td>
                    <button @click.stop="moveTo('selected', target)">MOVE</button>
                </td>
            </tr>
            <tr>
                <td><button @click.stop="moveUp('selected')">&uarr;</button></td>
                <td><button @click.stop="moveDown('selected')">&darr;</button></td>
            </tr>
            <tr>
                <td>
                    <button @click.stop="randomize()">RANDOMIZE</button>
                </td>
                <td>
                    <button @click.stop="reset()">SET TO ZERO</button>
                </td>
            </tr>
            <tr>
                <td>
                    <button @click.stop="selectAll()">SELECT ALL</button>
                </td>
                <td>
                    <button @click.stop="selectAll(false)">DESELECT ALL</button>
                </td>
            </tr>
            <tr>
                <td>
                    <button @click.stop="dither()">TOGGLE DITHER</button>
                </td>
                <td>
                    <button @click.stop="shutdown()">SHUTDOWN</button>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
export default {
    name: 'app',
    data() {
        return {
            motors: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
            pos: { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0, 16:0},
            tar: { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0, 16:0},
            sel: { 1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false, 13:false, 14:false, 15:false, 16:false},
            steps: 200,
            target: 0,
            connected: false,
            disconnected: false,
        };
    },
    sockets: {
        connect: function() {
            console.log('socket connected');
            this.connected = true;
            this.disconnected = false;
        },
        disconnect: function() {
            console.log('socket disconnected');
            this.disconnected = true;
        },
        update_target: function(val) {
            if(typeof val.motor == "undefined") {
                for(var motor in val) {
                    this.tar[motor] = val[motor];
                }
            } else {
                this.tar[val.motor] = val.tar;
            }
        },
        update_pos: function(val) {
            for(var motor in val) {
                this.pos[motor] = val[motor];
            }
        }
    },
    methods: {
        moveUp(motor) {
            this.move(motor, -1 * parseInt(this.steps));
        },
        moveDown(motor) {
            this.move(motor, parseInt(this.steps));
        },
        moveZero() {
            for(var motor in this.sel) {
                this.tar[motor] = 0;
                this.$socket.emit('update_target_manual', {
                    motor: motor,
                    tar: this.tar[motor]
                });
            }
        },
        move(motor, steps) {
            var self = this;
            if(motor === 'selected') {
                for(motor in this.sel) {
                    if(this.sel[motor]) self.move(motor, steps);
                }
            } else {
                this.tar[motor] += parseInt(steps);
                this.$socket.emit('update_target_manual', {
                    motor: motor,
                    tar: this.tar[motor]
                });
            }
        },
        moveTo(motor, target) {
            var self = this;
            if(motor === 'selected') {
                for(motor in this.sel) {
                    if(this.sel[motor]) self.moveTo(motor, target);
                }
            } else {
                this.tar[motor] = parseInt(target);
                this.$socket.emit('update_target_manual', {
                    motor: motor,
                    tar: this.tar[motor]
                });
            }
        },
        selectAll(sel = true) {
            for(var motor in this.sel) this.sel[motor] = sel;
        },
        dither() {
            this.$socket.emit('dither_manual');
        },
        randomize() {
            this.$socket.emit('randomize_manual');
        },
        reset() {
            if(confirm('Wirklich?') && confirm('Wirklich, wirklich?')) {
                this.$socket.emit('reset_manual');
            }
        },
        shutdown() {
            if(confirm('Wirklich?')) {
                this.$socket.emit('shutdown_manual');
            }
        }
    }
}
</script>

<style lang="scss">
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

.modal {
    display: table;
    position: fixed;
    background-color: white;
    color: black;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    z-index: 999;
}

.modal--danger {
    background-color: red;
    color: white;
}

.modal__inner {
    display: table-cell;
    vertical-align: middle;
}

.modal__inner > * {
    max-width: 300px;
    margin: 0 auto;
}

table {
    margin: 10px;
    border-collapse: collapse;
    float: left;

    &.motor:nth-child(4n+5) {
        clear: both;
    }

    &.settings {
        clear: both;
    }

    > tr {

        > th,
        > td {
            text-align: center;
            width: 50%;
            border: 1px solid black;
        }
    }
}
</style>
