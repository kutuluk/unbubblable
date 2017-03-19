/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
import * as $protobuf from "protobufjs";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Lazily resolved type references
const $lazyTypes = [];

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.protocol = (function() {

    /**
     * Namespace protocol.
     * @exports protocol
     * @namespace
     */
    const protocol = {};

    /**
     * MessageType enum.
     * @name MessageType
     * @memberof protocol
     * @enum {number}
     * @property {number} MsgController=0 MsgController value
     * @property {number} MsgPlayerPosition=1 MsgPlayerPosition value
     * @property {number} MsgTerrain=2 MsgTerrain value
     * @property {number} MsgChunk=3 MsgChunk value
     * @property {number} MsgChunkRequest=4 MsgChunkRequest value
     */
    protocol.MessageType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values["MsgController"] = 0;
        values["MsgPlayerPosition"] = 1;
        values["MsgTerrain"] = 2;
        values["MsgChunk"] = 3;
        values["MsgChunkRequest"] = 4;
        return values;
    })();

    protocol.MessageItem = (function() {

        /**
         * Constructs a new MessageItem.
         * @exports protocol.MessageItem
         * @constructor
         * @param {Object} [properties] Properties to set
         */
        function MessageItem(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageItem Type.
         * @type {number|undefined}
         */
        MessageItem.prototype.Type = 0;

        /**
         * MessageItem Body.
         * @type {Uint8Array|undefined}
         */
        MessageItem.prototype.Body = $util.newBuffer([]);

        // Lazily resolved type references
        const $types = {
            0: "protocol.MessageType"
        }; $lazyTypes.push($types);

        /**
         * Creates a new MessageItem instance using the specified properties.
         * @param {Object} [properties] Properties to set
         * @returns {protocol.MessageItem} MessageItem instance
         */
        MessageItem.create = function create(properties) {
            return new MessageItem(properties);
        };

        /**
         * Encodes the specified MessageItem message.
         * @param {protocol.MessageItem|Object} message MessageItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageItem.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Type !== undefined && message.hasOwnProperty("Type"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.Type);
            if (message.Body && message.hasOwnProperty("Body"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.Body);
            return writer;
        };

        /**
         * Encodes the specified MessageItem message, length delimited.
         * @param {protocol.MessageItem|Object} message MessageItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageItem.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageItem message from the specified reader or buffer.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.MessageItem} MessageItem
         */
        MessageItem.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.MessageItem();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.Type = reader.uint32();
                    break;
                case 2:
                    message.Body = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageItem message from the specified reader or buffer, length delimited.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.MessageItem} MessageItem
         */
        MessageItem.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageItem message.
         * @param {protocol.MessageItem|Object} message MessageItem message or plain object to verify
         * @returns {?string} `null` if valid, otherwise the reason why it is not
         */
        MessageItem.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Type !== undefined)
                switch (message.Type) {
                default:
                    return "Type: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            if (message.Body !== undefined)
                if (!(message.Body && typeof message.Body.length === "number" || $util.isString(message.Body)))
                    return "Body: buffer expected";
            return null;
        };

        /**
         * Creates a MessageItem message from a plain object. Also converts values to their respective internal types.
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.MessageItem} MessageItem
         */
        MessageItem.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.MessageItem)
                return object;
            let message = new $root.protocol.MessageItem();
            switch (object.Type) {
            case "MsgController":
            case 0:
                message.Type = 0;
                break;
            case "MsgPlayerPosition":
            case 1:
                message.Type = 1;
                break;
            case "MsgTerrain":
            case 2:
                message.Type = 2;
                break;
            case "MsgChunk":
            case 3:
                message.Type = 3;
                break;
            case "MsgChunkRequest":
            case 4:
                message.Type = 4;
                break;
            }
            if (object.Body !== undefined && object.Body !== null)
                if (typeof object.Body === "string")
                    $util.base64.decode(object.Body, message.Body = $util.newBuffer($util.base64.length(object.Body)), 0);
                else if (object.Body.length)
                    message.Body = object.Body;
            return message;
        };

        /**
         * Creates a MessageItem message from a plain object. Also converts values to their respective internal types.
         * This is an alias of {@link protocol.MessageItem.fromObject}.
         * @function
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.MessageItem} MessageItem
         */
        MessageItem.from = MessageItem.fromObject;

        /**
         * Creates a plain object from a MessageItem message. Also converts values to other types if specified.
         * @param {protocol.MessageItem} message MessageItem
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageItem.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.Type = options.enums === String ? "MsgController" : 0;
                object.Body = options.bytes === String ? "" : [];
            }
            if (message.Type !== undefined && message.Type !== null && message.hasOwnProperty("Type"))
                object.Type = options.enums === String ? $types[0][message.Type] : message.Type;
            if (message.Body !== undefined && message.Body !== null && message.hasOwnProperty("Body"))
                object.Body = options.bytes === String ? $util.base64.encode(message.Body, 0, message.Body.length) : options.bytes === Array ? Array.prototype.slice.call(message.Body) : message.Body;
            return object;
        };

        /**
         * Creates a plain object from this MessageItem message. Also converts values to other types if specified.
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageItem.prototype.toObject = function toObject(options) {
            return this.constructor.toObject(this, options);
        };

        /**
         * Converts this MessageItem to JSON.
         * @returns {Object.<string,*>} JSON object
         */
        MessageItem.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return MessageItem;
    })();

    protocol.MessageContainer = (function() {

        /**
         * Constructs a new MessageContainer.
         * @exports protocol.MessageContainer
         * @constructor
         * @param {Object} [properties] Properties to set
         */
        function MessageContainer(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageContainer Messages.
         * @type {Array.<protocol.MessageItem>|undefined}
         */
        MessageContainer.prototype.Messages = $util.emptyArray;

        // Lazily resolved type references
        const $types = {
            0: "protocol.MessageItem"
        }; $lazyTypes.push($types);

        /**
         * Creates a new MessageContainer instance using the specified properties.
         * @param {Object} [properties] Properties to set
         * @returns {protocol.MessageContainer} MessageContainer instance
         */
        MessageContainer.create = function create(properties) {
            return new MessageContainer(properties);
        };

        /**
         * Encodes the specified MessageContainer message.
         * @param {protocol.MessageContainer|Object} message MessageContainer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageContainer.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Messages !== undefined && message.hasOwnProperty("Messages"))
                for (let i = 0; i < message.Messages.length; ++i)
                    $types[0].encode(message.Messages[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified MessageContainer message, length delimited.
         * @param {protocol.MessageContainer|Object} message MessageContainer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageContainer.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageContainer message from the specified reader or buffer.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.MessageContainer} MessageContainer
         */
        MessageContainer.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.MessageContainer();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.Messages && message.Messages.length))
                        message.Messages = [];
                    message.Messages.push($types[0].decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageContainer message from the specified reader or buffer, length delimited.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.MessageContainer} MessageContainer
         */
        MessageContainer.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageContainer message.
         * @param {protocol.MessageContainer|Object} message MessageContainer message or plain object to verify
         * @returns {?string} `null` if valid, otherwise the reason why it is not
         */
        MessageContainer.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Messages !== undefined) {
                if (!Array.isArray(message.Messages))
                    return "Messages: array expected";
                for (let i = 0; i < message.Messages.length; ++i) {
                    let error = $types[0].verify(message.Messages[i]);
                    if (error)
                        return "Messages." + error;
                }
            }
            return null;
        };

        /**
         * Creates a MessageContainer message from a plain object. Also converts values to their respective internal types.
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.MessageContainer} MessageContainer
         */
        MessageContainer.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.MessageContainer)
                return object;
            let message = new $root.protocol.MessageContainer();
            if (object.Messages) {
                if (!Array.isArray(object.Messages))
                    throw TypeError(".protocol.MessageContainer.Messages: array expected");
                message.Messages = [];
                for (let i = 0; i < object.Messages.length; ++i) {
                    if (typeof object.Messages[i] !== "object")
                        throw TypeError(".protocol.MessageContainer.Messages: object expected");
                    message.Messages[i] = $types[0].fromObject(object.Messages[i]);
                }
            }
            return message;
        };

        /**
         * Creates a MessageContainer message from a plain object. Also converts values to their respective internal types.
         * This is an alias of {@link protocol.MessageContainer.fromObject}.
         * @function
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.MessageContainer} MessageContainer
         */
        MessageContainer.from = MessageContainer.fromObject;

        /**
         * Creates a plain object from a MessageContainer message. Also converts values to other types if specified.
         * @param {protocol.MessageContainer} message MessageContainer
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageContainer.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.Messages = [];
            if (message.Messages !== undefined && message.Messages !== null && message.hasOwnProperty("Messages")) {
                object.Messages = [];
                for (let j = 0; j < message.Messages.length; ++j)
                    object.Messages[j] = $types[0].toObject(message.Messages[j], options);
            }
            return object;
        };

        /**
         * Creates a plain object from this MessageContainer message. Also converts values to other types if specified.
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageContainer.prototype.toObject = function toObject(options) {
            return this.constructor.toObject(this, options);
        };

        /**
         * Converts this MessageContainer to JSON.
         * @returns {Object.<string,*>} JSON object
         */
        MessageContainer.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return MessageContainer;
    })();

    protocol.Controller = (function() {

        /**
         * Constructs a new Controller.
         * @exports protocol.Controller
         * @constructor
         * @param {Object} [properties] Properties to set
         */
        function Controller(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    this[keys[i]] = properties[keys[i]];
        }

        /**
         * Controller MoveForward.
         * @type {boolean|undefined}
         */
        Controller.prototype.MoveForward = false;

        /**
         * Controller MoveBackward.
         * @type {boolean|undefined}
         */
        Controller.prototype.MoveBackward = false;

        /**
         * Controller MoveLeft.
         * @type {boolean|undefined}
         */
        Controller.prototype.MoveLeft = false;

        /**
         * Controller MoveRight.
         * @type {boolean|undefined}
         */
        Controller.prototype.MoveRight = false;

        /**
         * Controller RotateLeft.
         * @type {boolean|undefined}
         */
        Controller.prototype.RotateLeft = false;

        /**
         * Controller RotateRight.
         * @type {boolean|undefined}
         */
        Controller.prototype.RotateRight = false;

        /**
         * Controller Mods.
         * @type {protocol.Controller.Modifiers|undefined}
         */
        Controller.prototype.Mods = null;

        // Lazily resolved type references
        const $types = {
            6: "protocol.Controller.Modifiers"
        }; $lazyTypes.push($types);

        /**
         * Creates a new Controller instance using the specified properties.
         * @param {Object} [properties] Properties to set
         * @returns {protocol.Controller} Controller instance
         */
        Controller.create = function create(properties) {
            return new Controller(properties);
        };

        /**
         * Encodes the specified Controller message.
         * @param {protocol.Controller|Object} message Controller message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Controller.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.MoveForward !== undefined && message.hasOwnProperty("MoveForward"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.MoveForward);
            if (message.MoveBackward !== undefined && message.hasOwnProperty("MoveBackward"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.MoveBackward);
            if (message.MoveLeft !== undefined && message.hasOwnProperty("MoveLeft"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.MoveLeft);
            if (message.MoveRight !== undefined && message.hasOwnProperty("MoveRight"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.MoveRight);
            if (message.RotateLeft !== undefined && message.hasOwnProperty("RotateLeft"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.RotateLeft);
            if (message.RotateRight !== undefined && message.hasOwnProperty("RotateRight"))
                writer.uint32(/* id 6, wireType 0 =*/48).bool(message.RotateRight);
            if (message.Mods && message.hasOwnProperty("Mods"))
                $types[6].encode(message.Mods, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Controller message, length delimited.
         * @param {protocol.Controller|Object} message Controller message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Controller.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Controller message from the specified reader or buffer.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Controller} Controller
         */
        Controller.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Controller();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.MoveForward = reader.bool();
                    break;
                case 2:
                    message.MoveBackward = reader.bool();
                    break;
                case 3:
                    message.MoveLeft = reader.bool();
                    break;
                case 4:
                    message.MoveRight = reader.bool();
                    break;
                case 5:
                    message.RotateLeft = reader.bool();
                    break;
                case 6:
                    message.RotateRight = reader.bool();
                    break;
                case 7:
                    message.Mods = $types[6].decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Controller message from the specified reader or buffer, length delimited.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Controller} Controller
         */
        Controller.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Controller message.
         * @param {protocol.Controller|Object} message Controller message or plain object to verify
         * @returns {?string} `null` if valid, otherwise the reason why it is not
         */
        Controller.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.MoveForward !== undefined)
                if (typeof message.MoveForward !== "boolean")
                    return "MoveForward: boolean expected";
            if (message.MoveBackward !== undefined)
                if (typeof message.MoveBackward !== "boolean")
                    return "MoveBackward: boolean expected";
            if (message.MoveLeft !== undefined)
                if (typeof message.MoveLeft !== "boolean")
                    return "MoveLeft: boolean expected";
            if (message.MoveRight !== undefined)
                if (typeof message.MoveRight !== "boolean")
                    return "MoveRight: boolean expected";
            if (message.RotateLeft !== undefined)
                if (typeof message.RotateLeft !== "boolean")
                    return "RotateLeft: boolean expected";
            if (message.RotateRight !== undefined)
                if (typeof message.RotateRight !== "boolean")
                    return "RotateRight: boolean expected";
            if (message.Mods !== undefined && message.Mods !== null) {
                let error = $types[6].verify(message.Mods);
                if (error)
                    return "Mods." + error;
            }
            return null;
        };

        /**
         * Creates a Controller message from a plain object. Also converts values to their respective internal types.
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Controller} Controller
         */
        Controller.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Controller)
                return object;
            let message = new $root.protocol.Controller();
            if (object.MoveForward !== undefined && object.MoveForward !== null)
                message.MoveForward = Boolean(object.MoveForward);
            if (object.MoveBackward !== undefined && object.MoveBackward !== null)
                message.MoveBackward = Boolean(object.MoveBackward);
            if (object.MoveLeft !== undefined && object.MoveLeft !== null)
                message.MoveLeft = Boolean(object.MoveLeft);
            if (object.MoveRight !== undefined && object.MoveRight !== null)
                message.MoveRight = Boolean(object.MoveRight);
            if (object.RotateLeft !== undefined && object.RotateLeft !== null)
                message.RotateLeft = Boolean(object.RotateLeft);
            if (object.RotateRight !== undefined && object.RotateRight !== null)
                message.RotateRight = Boolean(object.RotateRight);
            if (object.Mods !== undefined && object.Mods !== null) {
                if (typeof object.Mods !== "object")
                    throw TypeError(".protocol.Controller.Mods: object expected");
                message.Mods = $types[6].fromObject(object.Mods);
            }
            return message;
        };

        /**
         * Creates a Controller message from a plain object. Also converts values to their respective internal types.
         * This is an alias of {@link protocol.Controller.fromObject}.
         * @function
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Controller} Controller
         */
        Controller.from = Controller.fromObject;

        /**
         * Creates a plain object from a Controller message. Also converts values to other types if specified.
         * @param {protocol.Controller} message Controller
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Controller.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.MoveForward = false;
                object.MoveBackward = false;
                object.MoveLeft = false;
                object.MoveRight = false;
                object.RotateLeft = false;
                object.RotateRight = false;
                object.Mods = null;
            }
            if (message.MoveForward !== undefined && message.MoveForward !== null && message.hasOwnProperty("MoveForward"))
                object.MoveForward = message.MoveForward;
            if (message.MoveBackward !== undefined && message.MoveBackward !== null && message.hasOwnProperty("MoveBackward"))
                object.MoveBackward = message.MoveBackward;
            if (message.MoveLeft !== undefined && message.MoveLeft !== null && message.hasOwnProperty("MoveLeft"))
                object.MoveLeft = message.MoveLeft;
            if (message.MoveRight !== undefined && message.MoveRight !== null && message.hasOwnProperty("MoveRight"))
                object.MoveRight = message.MoveRight;
            if (message.RotateLeft !== undefined && message.RotateLeft !== null && message.hasOwnProperty("RotateLeft"))
                object.RotateLeft = message.RotateLeft;
            if (message.RotateRight !== undefined && message.RotateRight !== null && message.hasOwnProperty("RotateRight"))
                object.RotateRight = message.RotateRight;
            if (message.Mods !== undefined && message.Mods !== null && message.hasOwnProperty("Mods"))
                object.Mods = $types[6].toObject(message.Mods, options);
            return object;
        };

        /**
         * Creates a plain object from this Controller message. Also converts values to other types if specified.
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Controller.prototype.toObject = function toObject(options) {
            return this.constructor.toObject(this, options);
        };

        /**
         * Converts this Controller to JSON.
         * @returns {Object.<string,*>} JSON object
         */
        Controller.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Controller.Modifiers = (function() {

            /**
             * Constructs a new Modifiers.
             * @exports protocol.Controller.Modifiers
             * @constructor
             * @param {Object} [properties] Properties to set
             */
            function Modifiers(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        this[keys[i]] = properties[keys[i]];
            }

            /**
             * Modifiers Shift.
             * @type {boolean|undefined}
             */
            Modifiers.prototype.Shift = false;

            /**
             * Modifiers Ctrl.
             * @type {boolean|undefined}
             */
            Modifiers.prototype.Ctrl = false;

            /**
             * Modifiers Alt.
             * @type {boolean|undefined}
             */
            Modifiers.prototype.Alt = false;

            /**
             * Modifiers Meta.
             * @type {boolean|undefined}
             */
            Modifiers.prototype.Meta = false;

            /**
             * Creates a new Modifiers instance using the specified properties.
             * @param {Object} [properties] Properties to set
             * @returns {protocol.Controller.Modifiers} Modifiers instance
             */
            Modifiers.create = function create(properties) {
                return new Modifiers(properties);
            };

            /**
             * Encodes the specified Modifiers message.
             * @param {protocol.Controller.Modifiers|Object} message Modifiers message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Modifiers.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.Shift !== undefined && message.hasOwnProperty("Shift"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.Shift);
                if (message.Ctrl !== undefined && message.hasOwnProperty("Ctrl"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.Ctrl);
                if (message.Alt !== undefined && message.hasOwnProperty("Alt"))
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.Alt);
                if (message.Meta !== undefined && message.hasOwnProperty("Meta"))
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.Meta);
                return writer;
            };

            /**
             * Encodes the specified Modifiers message, length delimited.
             * @param {protocol.Controller.Modifiers|Object} message Modifiers message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Modifiers.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Modifiers message from the specified reader or buffer.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {protocol.Controller.Modifiers} Modifiers
             */
            Modifiers.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Controller.Modifiers();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.Shift = reader.bool();
                        break;
                    case 2:
                        message.Ctrl = reader.bool();
                        break;
                    case 3:
                        message.Alt = reader.bool();
                        break;
                    case 4:
                        message.Meta = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Modifiers message from the specified reader or buffer, length delimited.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {protocol.Controller.Modifiers} Modifiers
             */
            Modifiers.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Modifiers message.
             * @param {protocol.Controller.Modifiers|Object} message Modifiers message or plain object to verify
             * @returns {?string} `null` if valid, otherwise the reason why it is not
             */
            Modifiers.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.Shift !== undefined)
                    if (typeof message.Shift !== "boolean")
                        return "Shift: boolean expected";
                if (message.Ctrl !== undefined)
                    if (typeof message.Ctrl !== "boolean")
                        return "Ctrl: boolean expected";
                if (message.Alt !== undefined)
                    if (typeof message.Alt !== "boolean")
                        return "Alt: boolean expected";
                if (message.Meta !== undefined)
                    if (typeof message.Meta !== "boolean")
                        return "Meta: boolean expected";
                return null;
            };

            /**
             * Creates a Modifiers message from a plain object. Also converts values to their respective internal types.
             * @param {Object.<string,*>} object Plain object
             * @returns {protocol.Controller.Modifiers} Modifiers
             */
            Modifiers.fromObject = function fromObject(object) {
                if (object instanceof $root.protocol.Controller.Modifiers)
                    return object;
                let message = new $root.protocol.Controller.Modifiers();
                if (object.Shift !== undefined && object.Shift !== null)
                    message.Shift = Boolean(object.Shift);
                if (object.Ctrl !== undefined && object.Ctrl !== null)
                    message.Ctrl = Boolean(object.Ctrl);
                if (object.Alt !== undefined && object.Alt !== null)
                    message.Alt = Boolean(object.Alt);
                if (object.Meta !== undefined && object.Meta !== null)
                    message.Meta = Boolean(object.Meta);
                return message;
            };

            /**
             * Creates a Modifiers message from a plain object. Also converts values to their respective internal types.
             * This is an alias of {@link protocol.Controller.Modifiers.fromObject}.
             * @function
             * @param {Object.<string,*>} object Plain object
             * @returns {protocol.Controller.Modifiers} Modifiers
             */
            Modifiers.from = Modifiers.fromObject;

            /**
             * Creates a plain object from a Modifiers message. Also converts values to other types if specified.
             * @param {protocol.Controller.Modifiers} message Modifiers
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Modifiers.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.Shift = false;
                    object.Ctrl = false;
                    object.Alt = false;
                    object.Meta = false;
                }
                if (message.Shift !== undefined && message.Shift !== null && message.hasOwnProperty("Shift"))
                    object.Shift = message.Shift;
                if (message.Ctrl !== undefined && message.Ctrl !== null && message.hasOwnProperty("Ctrl"))
                    object.Ctrl = message.Ctrl;
                if (message.Alt !== undefined && message.Alt !== null && message.hasOwnProperty("Alt"))
                    object.Alt = message.Alt;
                if (message.Meta !== undefined && message.Meta !== null && message.hasOwnProperty("Meta"))
                    object.Meta = message.Meta;
                return object;
            };

            /**
             * Creates a plain object from this Modifiers message. Also converts values to other types if specified.
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Modifiers.prototype.toObject = function toObject(options) {
                return this.constructor.toObject(this, options);
            };

            /**
             * Converts this Modifiers to JSON.
             * @returns {Object.<string,*>} JSON object
             */
            Modifiers.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Modifiers;
        })();

        return Controller;
    })();

    protocol.Vec3 = (function() {

        /**
         * Constructs a new Vec3.
         * @exports protocol.Vec3
         * @constructor
         * @param {Object} [properties] Properties to set
         */
        function Vec3(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    this[keys[i]] = properties[keys[i]];
        }

        /**
         * Vec3 X.
         * @type {number|undefined}
         */
        Vec3.prototype.X = 0;

        /**
         * Vec3 Y.
         * @type {number|undefined}
         */
        Vec3.prototype.Y = 0;

        /**
         * Vec3 Z.
         * @type {number|undefined}
         */
        Vec3.prototype.Z = 0;

        /**
         * Creates a new Vec3 instance using the specified properties.
         * @param {Object} [properties] Properties to set
         * @returns {protocol.Vec3} Vec3 instance
         */
        Vec3.create = function create(properties) {
            return new Vec3(properties);
        };

        /**
         * Encodes the specified Vec3 message.
         * @param {protocol.Vec3|Object} message Vec3 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Vec3.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.X !== undefined && message.hasOwnProperty("X"))
                writer.uint32(/* id 1, wireType 1 =*/9).double(message.X);
            if (message.Y !== undefined && message.hasOwnProperty("Y"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.Y);
            if (message.Z !== undefined && message.hasOwnProperty("Z"))
                writer.uint32(/* id 3, wireType 1 =*/25).double(message.Z);
            return writer;
        };

        /**
         * Encodes the specified Vec3 message, length delimited.
         * @param {protocol.Vec3|Object} message Vec3 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Vec3.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Vec3 message from the specified reader or buffer.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Vec3} Vec3
         */
        Vec3.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Vec3();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.X = reader.double();
                    break;
                case 2:
                    message.Y = reader.double();
                    break;
                case 3:
                    message.Z = reader.double();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Vec3 message from the specified reader or buffer, length delimited.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Vec3} Vec3
         */
        Vec3.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Vec3 message.
         * @param {protocol.Vec3|Object} message Vec3 message or plain object to verify
         * @returns {?string} `null` if valid, otherwise the reason why it is not
         */
        Vec3.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.X !== undefined)
                if (typeof message.X !== "number")
                    return "X: number expected";
            if (message.Y !== undefined)
                if (typeof message.Y !== "number")
                    return "Y: number expected";
            if (message.Z !== undefined)
                if (typeof message.Z !== "number")
                    return "Z: number expected";
            return null;
        };

        /**
         * Creates a Vec3 message from a plain object. Also converts values to their respective internal types.
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Vec3} Vec3
         */
        Vec3.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Vec3)
                return object;
            let message = new $root.protocol.Vec3();
            if (object.X !== undefined && object.X !== null)
                message.X = Number(object.X);
            if (object.Y !== undefined && object.Y !== null)
                message.Y = Number(object.Y);
            if (object.Z !== undefined && object.Z !== null)
                message.Z = Number(object.Z);
            return message;
        };

        /**
         * Creates a Vec3 message from a plain object. Also converts values to their respective internal types.
         * This is an alias of {@link protocol.Vec3.fromObject}.
         * @function
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Vec3} Vec3
         */
        Vec3.from = Vec3.fromObject;

        /**
         * Creates a plain object from a Vec3 message. Also converts values to other types if specified.
         * @param {protocol.Vec3} message Vec3
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Vec3.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.X = 0;
                object.Y = 0;
                object.Z = 0;
            }
            if (message.X !== undefined && message.X !== null && message.hasOwnProperty("X"))
                object.X = message.X;
            if (message.Y !== undefined && message.Y !== null && message.hasOwnProperty("Y"))
                object.Y = message.Y;
            if (message.Z !== undefined && message.Z !== null && message.hasOwnProperty("Z"))
                object.Z = message.Z;
            return object;
        };

        /**
         * Creates a plain object from this Vec3 message. Also converts values to other types if specified.
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Vec3.prototype.toObject = function toObject(options) {
            return this.constructor.toObject(this, options);
        };

        /**
         * Converts this Vec3 to JSON.
         * @returns {Object.<string,*>} JSON object
         */
        Vec3.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Vec3;
    })();

    protocol.PlayerPosition = (function() {

        /**
         * Constructs a new PlayerPosition.
         * @exports protocol.PlayerPosition
         * @constructor
         * @param {Object} [properties] Properties to set
         */
        function PlayerPosition(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    this[keys[i]] = properties[keys[i]];
        }

        /**
         * PlayerPosition Position.
         * @type {protocol.Vec3|undefined}
         */
        PlayerPosition.prototype.Position = null;

        /**
         * PlayerPosition Motion.
         * @type {protocol.Vec3|undefined}
         */
        PlayerPosition.prototype.Motion = null;

        /**
         * PlayerPosition Angle.
         * @type {number|undefined}
         */
        PlayerPosition.prototype.Angle = 0;

        /**
         * PlayerPosition Slew.
         * @type {number|undefined}
         */
        PlayerPosition.prototype.Slew = 0;

        // Lazily resolved type references
        const $types = {
            0: "protocol.Vec3",
            1: "protocol.Vec3"
        }; $lazyTypes.push($types);

        /**
         * Creates a new PlayerPosition instance using the specified properties.
         * @param {Object} [properties] Properties to set
         * @returns {protocol.PlayerPosition} PlayerPosition instance
         */
        PlayerPosition.create = function create(properties) {
            return new PlayerPosition(properties);
        };

        /**
         * Encodes the specified PlayerPosition message.
         * @param {protocol.PlayerPosition|Object} message PlayerPosition message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerPosition.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Position && message.hasOwnProperty("Position"))
                $types[0].encode(message.Position, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.Motion && message.hasOwnProperty("Motion"))
                $types[1].encode(message.Motion, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.Angle !== undefined && message.hasOwnProperty("Angle"))
                writer.uint32(/* id 3, wireType 1 =*/25).double(message.Angle);
            if (message.Slew !== undefined && message.hasOwnProperty("Slew"))
                writer.uint32(/* id 4, wireType 1 =*/33).double(message.Slew);
            return writer;
        };

        /**
         * Encodes the specified PlayerPosition message, length delimited.
         * @param {protocol.PlayerPosition|Object} message PlayerPosition message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerPosition.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PlayerPosition message from the specified reader or buffer.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.PlayerPosition} PlayerPosition
         */
        PlayerPosition.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.PlayerPosition();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.Position = $types[0].decode(reader, reader.uint32());
                    break;
                case 2:
                    message.Motion = $types[1].decode(reader, reader.uint32());
                    break;
                case 3:
                    message.Angle = reader.double();
                    break;
                case 4:
                    message.Slew = reader.double();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PlayerPosition message from the specified reader or buffer, length delimited.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.PlayerPosition} PlayerPosition
         */
        PlayerPosition.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PlayerPosition message.
         * @param {protocol.PlayerPosition|Object} message PlayerPosition message or plain object to verify
         * @returns {?string} `null` if valid, otherwise the reason why it is not
         */
        PlayerPosition.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Position !== undefined && message.Position !== null) {
                let error = $types[0].verify(message.Position);
                if (error)
                    return "Position." + error;
            }
            if (message.Motion !== undefined && message.Motion !== null) {
                let error = $types[1].verify(message.Motion);
                if (error)
                    return "Motion." + error;
            }
            if (message.Angle !== undefined)
                if (typeof message.Angle !== "number")
                    return "Angle: number expected";
            if (message.Slew !== undefined)
                if (typeof message.Slew !== "number")
                    return "Slew: number expected";
            return null;
        };

        /**
         * Creates a PlayerPosition message from a plain object. Also converts values to their respective internal types.
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.PlayerPosition} PlayerPosition
         */
        PlayerPosition.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.PlayerPosition)
                return object;
            let message = new $root.protocol.PlayerPosition();
            if (object.Position !== undefined && object.Position !== null) {
                if (typeof object.Position !== "object")
                    throw TypeError(".protocol.PlayerPosition.Position: object expected");
                message.Position = $types[0].fromObject(object.Position);
            }
            if (object.Motion !== undefined && object.Motion !== null) {
                if (typeof object.Motion !== "object")
                    throw TypeError(".protocol.PlayerPosition.Motion: object expected");
                message.Motion = $types[1].fromObject(object.Motion);
            }
            if (object.Angle !== undefined && object.Angle !== null)
                message.Angle = Number(object.Angle);
            if (object.Slew !== undefined && object.Slew !== null)
                message.Slew = Number(object.Slew);
            return message;
        };

        /**
         * Creates a PlayerPosition message from a plain object. Also converts values to their respective internal types.
         * This is an alias of {@link protocol.PlayerPosition.fromObject}.
         * @function
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.PlayerPosition} PlayerPosition
         */
        PlayerPosition.from = PlayerPosition.fromObject;

        /**
         * Creates a plain object from a PlayerPosition message. Also converts values to other types if specified.
         * @param {protocol.PlayerPosition} message PlayerPosition
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PlayerPosition.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.Position = null;
                object.Motion = null;
                object.Angle = 0;
                object.Slew = 0;
            }
            if (message.Position !== undefined && message.Position !== null && message.hasOwnProperty("Position"))
                object.Position = $types[0].toObject(message.Position, options);
            if (message.Motion !== undefined && message.Motion !== null && message.hasOwnProperty("Motion"))
                object.Motion = $types[1].toObject(message.Motion, options);
            if (message.Angle !== undefined && message.Angle !== null && message.hasOwnProperty("Angle"))
                object.Angle = message.Angle;
            if (message.Slew !== undefined && message.Slew !== null && message.hasOwnProperty("Slew"))
                object.Slew = message.Slew;
            return object;
        };

        /**
         * Creates a plain object from this PlayerPosition message. Also converts values to other types if specified.
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PlayerPosition.prototype.toObject = function toObject(options) {
            return this.constructor.toObject(this, options);
        };

        /**
         * Converts this PlayerPosition to JSON.
         * @returns {Object.<string,*>} JSON object
         */
        PlayerPosition.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return PlayerPosition;
    })();

    protocol.Terrain = (function() {

        /**
         * Constructs a new Terrain.
         * @exports protocol.Terrain
         * @constructor
         * @param {Object} [properties] Properties to set
         */
        function Terrain(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    this[keys[i]] = properties[keys[i]];
        }

        /**
         * Terrain Width.
         * @type {number|undefined}
         */
        Terrain.prototype.Width = 0;

        /**
         * Terrain Height.
         * @type {number|undefined}
         */
        Terrain.prototype.Height = 0;

        /**
         * Terrain Seed.
         * @type {number|$protobuf.Long|undefined}
         */
        Terrain.prototype.Seed = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Terrain ChunkSize.
         * @type {number|undefined}
         */
        Terrain.prototype.ChunkSize = 0;

        /**
         * Creates a new Terrain instance using the specified properties.
         * @param {Object} [properties] Properties to set
         * @returns {protocol.Terrain} Terrain instance
         */
        Terrain.create = function create(properties) {
            return new Terrain(properties);
        };

        /**
         * Encodes the specified Terrain message.
         * @param {protocol.Terrain|Object} message Terrain message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Terrain.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Width !== undefined && message.hasOwnProperty("Width"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.Width);
            if (message.Height !== undefined && message.hasOwnProperty("Height"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.Height);
            if (message.Seed !== undefined && message.Seed !== null && message.hasOwnProperty("Seed"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.Seed);
            if (message.ChunkSize !== undefined && message.hasOwnProperty("ChunkSize"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.ChunkSize);
            return writer;
        };

        /**
         * Encodes the specified Terrain message, length delimited.
         * @param {protocol.Terrain|Object} message Terrain message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Terrain.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Terrain message from the specified reader or buffer.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Terrain} Terrain
         */
        Terrain.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Terrain();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.Width = reader.int32();
                    break;
                case 2:
                    message.Height = reader.int32();
                    break;
                case 3:
                    message.Seed = reader.int64();
                    break;
                case 4:
                    message.ChunkSize = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Terrain message from the specified reader or buffer, length delimited.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Terrain} Terrain
         */
        Terrain.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Terrain message.
         * @param {protocol.Terrain|Object} message Terrain message or plain object to verify
         * @returns {?string} `null` if valid, otherwise the reason why it is not
         */
        Terrain.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Width !== undefined)
                if (!$util.isInteger(message.Width))
                    return "Width: integer expected";
            if (message.Height !== undefined)
                if (!$util.isInteger(message.Height))
                    return "Height: integer expected";
            if (message.Seed !== undefined)
                if (!$util.isInteger(message.Seed) && !(message.Seed && $util.isInteger(message.Seed.low) && $util.isInteger(message.Seed.high)))
                    return "Seed: integer|Long expected";
            if (message.ChunkSize !== undefined)
                if (!$util.isInteger(message.ChunkSize))
                    return "ChunkSize: integer expected";
            return null;
        };

        /**
         * Creates a Terrain message from a plain object. Also converts values to their respective internal types.
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Terrain} Terrain
         */
        Terrain.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Terrain)
                return object;
            let message = new $root.protocol.Terrain();
            if (object.Width !== undefined && object.Width !== null)
                message.Width = object.Width | 0;
            if (object.Height !== undefined && object.Height !== null)
                message.Height = object.Height | 0;
            if (object.Seed !== undefined && object.Seed !== null)
                if ($util.Long)
                    (message.Seed = $util.Long.fromValue(object.Seed)).unsigned = false;
                else if (typeof object.Seed === "string")
                    message.Seed = parseInt(object.Seed, 10);
                else if (typeof object.Seed === "number")
                    message.Seed = object.Seed;
                else if (typeof object.Seed === "object")
                    message.Seed = new $util.LongBits(object.Seed.low >>> 0, object.Seed.high >>> 0).toNumber();
            if (object.ChunkSize !== undefined && object.ChunkSize !== null)
                message.ChunkSize = object.ChunkSize | 0;
            return message;
        };

        /**
         * Creates a Terrain message from a plain object. Also converts values to their respective internal types.
         * This is an alias of {@link protocol.Terrain.fromObject}.
         * @function
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Terrain} Terrain
         */
        Terrain.from = Terrain.fromObject;

        /**
         * Creates a plain object from a Terrain message. Also converts values to other types if specified.
         * @param {protocol.Terrain} message Terrain
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Terrain.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.Width = 0;
                object.Height = 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.Seed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.Seed = options.longs === String ? "0" : 0;
                object.ChunkSize = 0;
            }
            if (message.Width !== undefined && message.Width !== null && message.hasOwnProperty("Width"))
                object.Width = message.Width;
            if (message.Height !== undefined && message.Height !== null && message.hasOwnProperty("Height"))
                object.Height = message.Height;
            if (message.Seed !== undefined && message.Seed !== null && message.hasOwnProperty("Seed"))
                if (typeof message.Seed === "number")
                    object.Seed = options.longs === String ? String(message.Seed) : message.Seed;
                else
                    object.Seed = options.longs === String ? $util.Long.prototype.toString.call(message.Seed) : options.longs === Number ? new $util.LongBits(message.Seed.low >>> 0, message.Seed.high >>> 0).toNumber() : message.Seed;
            if (message.ChunkSize !== undefined && message.ChunkSize !== null && message.hasOwnProperty("ChunkSize"))
                object.ChunkSize = message.ChunkSize;
            return object;
        };

        /**
         * Creates a plain object from this Terrain message. Also converts values to other types if specified.
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Terrain.prototype.toObject = function toObject(options) {
            return this.constructor.toObject(this, options);
        };

        /**
         * Converts this Terrain to JSON.
         * @returns {Object.<string,*>} JSON object
         */
        Terrain.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Terrain;
    })();

    protocol.Chunk = (function() {

        /**
         * Constructs a new Chunk.
         * @exports protocol.Chunk
         * @constructor
         * @param {Object} [properties] Properties to set
         */
        function Chunk(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    this[keys[i]] = properties[keys[i]];
        }

        /**
         * Chunk Index.
         * @type {number|undefined}
         */
        Chunk.prototype.Index = 0;

        /**
         * Chunk Map.
         * @type {Array.<protocol.Chunk.Tile>|undefined}
         */
        Chunk.prototype.Map = $util.emptyArray;

        // Lazily resolved type references
        const $types = {
            1: "protocol.Chunk.Tile"
        }; $lazyTypes.push($types);

        /**
         * Creates a new Chunk instance using the specified properties.
         * @param {Object} [properties] Properties to set
         * @returns {protocol.Chunk} Chunk instance
         */
        Chunk.create = function create(properties) {
            return new Chunk(properties);
        };

        /**
         * Encodes the specified Chunk message.
         * @param {protocol.Chunk|Object} message Chunk message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Chunk.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Index !== undefined && message.hasOwnProperty("Index"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.Index);
            if (message.Map !== undefined && message.hasOwnProperty("Map"))
                for (let i = 0; i < message.Map.length; ++i)
                    $types[1].encode(message.Map[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Chunk message, length delimited.
         * @param {protocol.Chunk|Object} message Chunk message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Chunk.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Chunk message from the specified reader or buffer.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Chunk} Chunk
         */
        Chunk.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Chunk();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.Index = reader.int32();
                    break;
                case 2:
                    if (!(message.Map && message.Map.length))
                        message.Map = [];
                    message.Map.push($types[1].decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Chunk message from the specified reader or buffer, length delimited.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Chunk} Chunk
         */
        Chunk.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Chunk message.
         * @param {protocol.Chunk|Object} message Chunk message or plain object to verify
         * @returns {?string} `null` if valid, otherwise the reason why it is not
         */
        Chunk.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Index !== undefined)
                if (!$util.isInteger(message.Index))
                    return "Index: integer expected";
            if (message.Map !== undefined) {
                if (!Array.isArray(message.Map))
                    return "Map: array expected";
                for (let i = 0; i < message.Map.length; ++i) {
                    let error = $types[1].verify(message.Map[i]);
                    if (error)
                        return "Map." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Chunk message from a plain object. Also converts values to their respective internal types.
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Chunk} Chunk
         */
        Chunk.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Chunk)
                return object;
            let message = new $root.protocol.Chunk();
            if (object.Index !== undefined && object.Index !== null)
                message.Index = object.Index | 0;
            if (object.Map) {
                if (!Array.isArray(object.Map))
                    throw TypeError(".protocol.Chunk.Map: array expected");
                message.Map = [];
                for (let i = 0; i < object.Map.length; ++i) {
                    if (typeof object.Map[i] !== "object")
                        throw TypeError(".protocol.Chunk.Map: object expected");
                    message.Map[i] = $types[1].fromObject(object.Map[i]);
                }
            }
            return message;
        };

        /**
         * Creates a Chunk message from a plain object. Also converts values to their respective internal types.
         * This is an alias of {@link protocol.Chunk.fromObject}.
         * @function
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Chunk} Chunk
         */
        Chunk.from = Chunk.fromObject;

        /**
         * Creates a plain object from a Chunk message. Also converts values to other types if specified.
         * @param {protocol.Chunk} message Chunk
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Chunk.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.Map = [];
            if (options.defaults)
                object.Index = 0;
            if (message.Index !== undefined && message.Index !== null && message.hasOwnProperty("Index"))
                object.Index = message.Index;
            if (message.Map !== undefined && message.Map !== null && message.hasOwnProperty("Map")) {
                object.Map = [];
                for (let j = 0; j < message.Map.length; ++j)
                    object.Map[j] = $types[1].toObject(message.Map[j], options);
            }
            return object;
        };

        /**
         * Creates a plain object from this Chunk message. Also converts values to other types if specified.
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Chunk.prototype.toObject = function toObject(options) {
            return this.constructor.toObject(this, options);
        };

        /**
         * Converts this Chunk to JSON.
         * @returns {Object.<string,*>} JSON object
         */
        Chunk.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Chunk.Tile = (function() {

            /**
             * Constructs a new Tile.
             * @exports protocol.Chunk.Tile
             * @constructor
             * @param {Object} [properties] Properties to set
             */
            function Tile(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        this[keys[i]] = properties[keys[i]];
            }

            /**
             * Tile Ground.
             * @type {number|undefined}
             */
            Tile.prototype.Ground = 0;

            /**
             * Tile Block.
             * @type {number|undefined}
             */
            Tile.prototype.Block = 0;

            /**
             * Tile Detail.
             * @type {number|undefined}
             */
            Tile.prototype.Detail = 0;

            /**
             * Creates a new Tile instance using the specified properties.
             * @param {Object} [properties] Properties to set
             * @returns {protocol.Chunk.Tile} Tile instance
             */
            Tile.create = function create(properties) {
                return new Tile(properties);
            };

            /**
             * Encodes the specified Tile message.
             * @param {protocol.Chunk.Tile|Object} message Tile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Tile.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.Ground !== undefined && message.hasOwnProperty("Ground"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.Ground);
                if (message.Block !== undefined && message.hasOwnProperty("Block"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.Block);
                if (message.Detail !== undefined && message.hasOwnProperty("Detail"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.Detail);
                return writer;
            };

            /**
             * Encodes the specified Tile message, length delimited.
             * @param {protocol.Chunk.Tile|Object} message Tile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Tile.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Tile message from the specified reader or buffer.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {protocol.Chunk.Tile} Tile
             */
            Tile.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Chunk.Tile();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.Ground = reader.int32();
                        break;
                    case 2:
                        message.Block = reader.int32();
                        break;
                    case 3:
                        message.Detail = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Tile message from the specified reader or buffer, length delimited.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {protocol.Chunk.Tile} Tile
             */
            Tile.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Tile message.
             * @param {protocol.Chunk.Tile|Object} message Tile message or plain object to verify
             * @returns {?string} `null` if valid, otherwise the reason why it is not
             */
            Tile.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.Ground !== undefined)
                    if (!$util.isInteger(message.Ground))
                        return "Ground: integer expected";
                if (message.Block !== undefined)
                    if (!$util.isInteger(message.Block))
                        return "Block: integer expected";
                if (message.Detail !== undefined)
                    if (!$util.isInteger(message.Detail))
                        return "Detail: integer expected";
                return null;
            };

            /**
             * Creates a Tile message from a plain object. Also converts values to their respective internal types.
             * @param {Object.<string,*>} object Plain object
             * @returns {protocol.Chunk.Tile} Tile
             */
            Tile.fromObject = function fromObject(object) {
                if (object instanceof $root.protocol.Chunk.Tile)
                    return object;
                let message = new $root.protocol.Chunk.Tile();
                if (object.Ground !== undefined && object.Ground !== null)
                    message.Ground = object.Ground | 0;
                if (object.Block !== undefined && object.Block !== null)
                    message.Block = object.Block | 0;
                if (object.Detail !== undefined && object.Detail !== null)
                    message.Detail = object.Detail | 0;
                return message;
            };

            /**
             * Creates a Tile message from a plain object. Also converts values to their respective internal types.
             * This is an alias of {@link protocol.Chunk.Tile.fromObject}.
             * @function
             * @param {Object.<string,*>} object Plain object
             * @returns {protocol.Chunk.Tile} Tile
             */
            Tile.from = Tile.fromObject;

            /**
             * Creates a plain object from a Tile message. Also converts values to other types if specified.
             * @param {protocol.Chunk.Tile} message Tile
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Tile.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.Ground = 0;
                    object.Block = 0;
                    object.Detail = 0;
                }
                if (message.Ground !== undefined && message.Ground !== null && message.hasOwnProperty("Ground"))
                    object.Ground = message.Ground;
                if (message.Block !== undefined && message.Block !== null && message.hasOwnProperty("Block"))
                    object.Block = message.Block;
                if (message.Detail !== undefined && message.Detail !== null && message.hasOwnProperty("Detail"))
                    object.Detail = message.Detail;
                return object;
            };

            /**
             * Creates a plain object from this Tile message. Also converts values to other types if specified.
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Tile.prototype.toObject = function toObject(options) {
                return this.constructor.toObject(this, options);
            };

            /**
             * Converts this Tile to JSON.
             * @returns {Object.<string,*>} JSON object
             */
            Tile.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Tile;
        })();

        return Chunk;
    })();

    protocol.ChunkRequest = (function() {

        /**
         * Constructs a new ChunkRequest.
         * @exports protocol.ChunkRequest
         * @constructor
         * @param {Object} [properties] Properties to set
         */
        function ChunkRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    this[keys[i]] = properties[keys[i]];
        }

        /**
         * ChunkRequest Chunks.
         * @type {Array.<number>|undefined}
         */
        ChunkRequest.prototype.Chunks = $util.emptyArray;

        /**
         * Creates a new ChunkRequest instance using the specified properties.
         * @param {Object} [properties] Properties to set
         * @returns {protocol.ChunkRequest} ChunkRequest instance
         */
        ChunkRequest.create = function create(properties) {
            return new ChunkRequest(properties);
        };

        /**
         * Encodes the specified ChunkRequest message.
         * @param {protocol.ChunkRequest|Object} message ChunkRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChunkRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Chunks && message.Chunks.length && message.hasOwnProperty("Chunks")) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork();
                for (let i = 0; i < message.Chunks.length; ++i)
                    writer.int32(message.Chunks[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified ChunkRequest message, length delimited.
         * @param {protocol.ChunkRequest|Object} message ChunkRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChunkRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ChunkRequest message from the specified reader or buffer.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.ChunkRequest} ChunkRequest
         */
        ChunkRequest.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.ChunkRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.Chunks && message.Chunks.length))
                        message.Chunks = [];
                    if ((tag & 7) === 2) {
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.Chunks.push(reader.int32());
                    } else
                        message.Chunks.push(reader.int32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ChunkRequest message from the specified reader or buffer, length delimited.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.ChunkRequest} ChunkRequest
         */
        ChunkRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ChunkRequest message.
         * @param {protocol.ChunkRequest|Object} message ChunkRequest message or plain object to verify
         * @returns {?string} `null` if valid, otherwise the reason why it is not
         */
        ChunkRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Chunks !== undefined) {
                if (!Array.isArray(message.Chunks))
                    return "Chunks: array expected";
                for (let i = 0; i < message.Chunks.length; ++i)
                    if (!$util.isInteger(message.Chunks[i]))
                        return "Chunks: integer[] expected";
            }
            return null;
        };

        /**
         * Creates a ChunkRequest message from a plain object. Also converts values to their respective internal types.
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.ChunkRequest} ChunkRequest
         */
        ChunkRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.ChunkRequest)
                return object;
            let message = new $root.protocol.ChunkRequest();
            if (object.Chunks) {
                if (!Array.isArray(object.Chunks))
                    throw TypeError(".protocol.ChunkRequest.Chunks: array expected");
                message.Chunks = [];
                for (let i = 0; i < object.Chunks.length; ++i)
                    message.Chunks[i] = object.Chunks[i] | 0;
            }
            return message;
        };

        /**
         * Creates a ChunkRequest message from a plain object. Also converts values to their respective internal types.
         * This is an alias of {@link protocol.ChunkRequest.fromObject}.
         * @function
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.ChunkRequest} ChunkRequest
         */
        ChunkRequest.from = ChunkRequest.fromObject;

        /**
         * Creates a plain object from a ChunkRequest message. Also converts values to other types if specified.
         * @param {protocol.ChunkRequest} message ChunkRequest
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ChunkRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.Chunks = [];
            if (message.Chunks !== undefined && message.Chunks !== null && message.hasOwnProperty("Chunks")) {
                object.Chunks = [];
                for (let j = 0; j < message.Chunks.length; ++j)
                    object.Chunks[j] = message.Chunks[j];
            }
            return object;
        };

        /**
         * Creates a plain object from this ChunkRequest message. Also converts values to other types if specified.
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ChunkRequest.prototype.toObject = function toObject(options) {
            return this.constructor.toObject(this, options);
        };

        /**
         * Converts this ChunkRequest to JSON.
         * @returns {Object.<string,*>} JSON object
         */
        ChunkRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ChunkRequest;
    })();

    return protocol;
})();

// Resolve lazy type references to actual types
$util.lazyResolve($root, $lazyTypes);

export { $root as default };
