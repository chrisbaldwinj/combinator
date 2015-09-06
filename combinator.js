(function() {
    "use strict";

    //key combinators that are not allowed
    var system_keys = ["ctrl+n", "ctrl+shift+n", "ctrl+t", "ctrl+shift+t", "ctrl+w", "ctrl+shift+w"];

    //default options
    var defaults = {
        title: null,
        exec: function() {},
        repeat: true,
        input: true,
        once: false,
        executed: false,
        called: false,
        ignoreClass: false
    };

    //make it easier to listen to keys
    var keyListener = false;

    //after testing the js only understands 4 keys being registered at a time.
    var MAX_KEYS = 4;

    //hold the current keys pressed in an array in order of succession (ctrl, alt, shift) + key
    var current_keys = [];

    //testing if this works to turn off repeat
    var repeatable_command = null;

    //if user wants no repeat we need to know when they release the keys.
    var key_pressed = false;
    //cross browser addEventListener
    function addEventListener(targ, evt, fn) {
        if ("addEventListener" in document) {
            targ.addEventListener(evt, fn);
        } else if ("attachEvent" in document) {
            targ.attachEvent("on" + evt, fn);
        } else {
            targ["on" + evt] = fn;
        }
    }

    function removeEventListener(targ, evt, fn) {
        if ("addEventListener" in document) {
            targ.removeEventListener(evt, fn);
        } else if ("detachEvent" in document) {
            targ.attachEvent("on" + evt, fn);
        } else {
            targ["on" + evt] = null;
        }
    }


    //window.keyCodes
    //keyCodes.literal is backwards charCode definition example: enter :: 13
    //keyCodes.numerical gives the key name from a charCode example: 13 :: enter
    window.keyCodes = {};
    window.keyCodes.numerical = {
        8: "backspace",
        9: "tab",
        13: "enter",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "pause/break",
        20: "caps lock",
        27: "escapse",
        33: "page up",
        34: "page down",
        35: "end",
        36: "home",
        37: "left arrow",
        38: "up arrow",
        39: "right arrow",
        40: "down arrow",
        45: "insert",
        46: "delete",
        48: "0",
        49: "1",
        50: "2",
        51: "3",
        52: "4",
        53: "5",
        54: "6",
        55: "7",
        56: "8",
        57: "9",
        65: "A",
        66: "B",
        67: "C",
        68: "D",
        69: "E",
        70: "F",
        71: "G",
        72: "H",
        73: "I",
        74: "J",
        75: "K",
        76: "L",
        77: "M",
        78: "N",
        79: "O",
        80: "P",
        81: "Q",
        82: "R",
        83: "S",
        84: "T",
        85: "U",
        86: "V",
        87: "W",
        88: "X",
        89: "Y",
        90: "Z",
        91: "left window",
        106: "multiply",
        107: "add",
        109: "subtract",
        110: "decimal point",
        111: "divide",
        186: "semi-colon",
        187: "equal sign",
        188: "comma",
        189: "dash",
        190: "period",
        191: "forward slash",
        192: "grave accent",
        219: "open bracket",
        220: "back slash",
        221: "close bracket",
        222: "single quote"
    };
    window.keyCodes.literal = {
        "backspace": 8,
        "tab": 9,
        "enter": 13,
        "shift": 16,
        "ctrl": 17,
        "alt": 18,
        "pause/break": 19,
        "caps lock": 20,
        "escape": 27,
        "page up": 33,
        "page down": 34,
        "end": 35,
        "home": 36,
        "left arrow": 37,
        "up arrow": 38,
        "right arrow": 39,
        "down arrow": 40,
        "insert": 45,
        "delete": 46,
        "0": 48,
        "1": 49,
        "2": 50,
        "3": 51,
        "4": 52,
        "5": 53,
        "6": 54,
        "7": 55,
        "8": 56,
        "9": 57,
        "A": 65,
        "B": 66,
        "C": 67,
        "D": 68,
        "E": 69,
        "F": 70,
        "G": 71,
        "H": 72,
        "I": 73,
        "J": 74,
        "K": 75,
        "L": 76,
        "M": 77,
        "N": 78,
        "O": 79,
        "P": 80,
        "Q": 81,
        "R": 82,
        "S": 83,
        "T": 84,
        "U": 85,
        "V": 86,
        "W": 87,
        "X": 88,
        "Y": 89,
        "Z": 90,
        "left window": 91,
        "multiply": 106,
        "add": 107,
        "subtract": 109,
        "decimal point": 110,
        "divide": 111,
        "semi-colon": 186,
        "equal sign": 187,
        "comma": 188,
        "dash": 189,
        "period": 190,
        "forward slash": 191,
        "grave accent": 192,
        "open bracket": 219,
        "back slash": 220,
        "close bracket": 221,
        "single quote": 222
    };


    /*
      sequence is a callback function that is returned to the exec function
      This function is used to listen to the next key clicked
      This function will not run after a new command has been pressed
      `this` is the object that called sequence
    */
    function Sequence(key, fn, location) {
        if (!location) location = document;
        var self = this;
        addListener(location, "keydown", function sequenceMode(e) {
            if (self.waiting) {
                if (keyCodes.literal[key.toUpperCase()] === e.which) {
                    fn.call(self, e);
                    self.waiting = false;
                    removeEventListener(this, "keydown", sequenceMode);
                }
            } else removeEventListener(location, "keydown", sequenceMode);
        });
    }

    function command_iterator(fn) {
        for (var command in commands.cmd) {
            fn.call(commands.cmd, command);
        }
    }

    function listen(target) {
        if (!target) target = document;
        addEventListener(target, "keydown", function(e) {
            var key, charCode, joined_keys, commd, targ;
            key = 'which' in e ? e.which : e.keyCode;
            if (e.ctrlKey && current_keys.indexOf("ctrl") === -1) {
                current_keys.push("ctrl");
            }
            if (e.altKey && current_keys.indexOf("alt") === -1) {
                current_keys.push("alt");
            }
            if (e.shiftKey && current_keys.indexOf("shift") === -1) {
                current_keys.push("shift");
            }

            //remove all waiting sequences
            if (current_keys.length > 0) {
                key_pressed = true;
                command_iterator(function(cmd) {
                    if (this[cmd].hasOwnProperty("waiting"))
                        delete this[cmd].waiting;
                });
            }


            charCode = keyCodes.numerical[key];
            if (current_keys.indexOf(charCode) === -1) {
                current_keys.push(charCode);
            }

            joined_keys = current_keys.join("+").toLowerCase();
            if (commands.cmd.hasOwnProperty(joined_keys)) {
                commd = commands.cmd[joined_keys];
                e.preventDefault();
                e.stopPropagation();

                if ((!commd.repeat && commd.executed) || (commd.once && commd.called))
                    return false;
                if (!commd.repeat)
                    repeatable_command = commd;

                //test if the user is inside a content editable area such as inputs, textarea, contenteditable elements
                if (!commd.input) {
                    targ = e.target;

                    while (targ != document.body) {
                        if (!commd.input && (targ.tagName.toLowerCase() === "input" || targ.tagName.toLowerCase() === "textarea") && !(/ignore-halt/g).test(targ.className))
                            return false;

                        if (!commd.input && targ.hasAttribute("contenteditable") && (targ.getAttribute("contenteditable")) === true && !(/ignore-halt/g).test(targ.className))
                            return false;

                        targ = targ.parentNode;
                    }
                }

                commd.waiting = true;
                commd.exec.call(e, Sequence.bind(commd));
                commd.executed = true;
                commd.called = true;
                current_keys = [];
                joined_keys = "";
            }
        });

        addEventListener(target, "keyup", function(e) {
            var key = 'which' in e ? e.which : e.keyCode,
                index, cmd;
            cmd = current_keys.join("+").toLowerCase();
            if (key === 17 || key === 18) {
                e.preventDefault();
                key_pressed = false;
                current_keys = [];
                return false;
            } else {
                index = current_keys.indexOf(keyCodes.numerical[key]);
                if (index > -1) {
                    current_keys.splice(index, 1);
                }
                if (repeatable_command !== null)
                    repeatable_command.executed = false;
            }
        });

    }


    /*
      Fetch grabs the object attached to a combinator,
      Binds commands as the this object as well as sequence to the first argument
      returns the new object.
    */
    function fetch(combinator) {
        combinator = combinator.toLowerCase();
        if (commands.cmd.hasOwnProperty(combinator)) {
            return commands.cmd[combinator];
        }
        return null;
    }


    /*
      Release deletes the command specified, if it doesn't exist we return false.
    */
    function release(combinator) {
        combinator = combinator.toLowerCase();
        if (commands.cmd.hasOwnProperty(combinator)) {
            delete commands.cmd[combinator];
            return true;
        }
        return false;
    }


    /*
      Register creates a new command for the commands object.
      Rules: Cannot overwrite other commands
             Combinator cannot be longer than MAX_KEYS (4)
             Combinator cannot be a null combinator from the list above
    */
    function register(combinator, options) {
        var def = {};

        //if the combinator is not a string exit the register function
        if (typeof combinator !== "string")
            return new Error("The first argument for register must be a string combinator.");

        combinator = combinator.toLowerCase();
        if (/Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
            combinator.replace("ctrl", "meta");
        }
        //if the combinator is inside the system_keys section exit
        if (system_keys.indexOf(combinator) > -1 === true)
            return new Error(combinator + " cannot be used, this is a system specific combinator");

        //if commands.cmd already has a combinator that matches the new one exit.
        if (commands.cmd.hasOwnProperty(combinator))
            return new Error(combinator + " already exists. Please release this combinator before overwriting.");


        //if the combinator is longer than 4 keys exit
        if (combinator.split("+").length > 4)
            return new Error(combinator + " is too long, the system can only handle four consecutive keys pressed.");

        //now we'll go through the options and defaults and ensure if they add their own properties we don't use them
        //also we won't be overwriting preset executed called and waiting.
        for (var option in defaults) {
            if (options.hasOwnProperty(option) && option !== "executed" && option !== "called" && option !== "waiting") {
                def[option] = options[option];
            } else {
                def[option] = defaults[option];
            }
        }

        commands.cmd[combinator] = def;
    }


    /*
      Changed the fetch from executing to trigger now.
    */
    function trigger(combinator) {
        combinator = combinator.toLowerCase();
        if (commands.cmd.hasOwnProperty(combinator)) {
            var newObj = commands.cmd[combinator];
            newObj.waiting = true;
            newObj.exec.call(commands, Sequence.bind(newObj));
        }
    }

    function listenToKeys(fn, target) {
        if (!target)
            target = document;

        keyListener = true;
        addEventListener(target, "keydown", function microlistener(e) {
            if (keyListener) {
                var key = 'which' in e ? e.which : e.keyCode;
                var literal = keyCodes.numerical[key];
                fn.call(this, literal, e);
            } else removeEventListener(this, "keydown", microlistener);
        });

        return {
            stop: unlistenToKeys
        };
    }

    function unlistenToKeys() {
        keyListener = false;
    }

    function reset(combinator) {
        combinator = combinator.toLowerCase();
        if (commands.cmd.hasOwnProperty(combinator)) {
            commands.cmd[combinator].executed = false;
            commands.cmd[combinator].called = false;
            return true;
        }
        return false;
    }
    //commands properties
    var commands = {
        fetch: fetch,
        register: register,
        listen: listen,
        release: release,
        reset: reset,
        trigger: trigger,
        record: listenToKeys,
        cmd: {}
    };

    window.commands = commands;
})();
