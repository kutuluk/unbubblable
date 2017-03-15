/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
import * as $protobuf from "protobufjs";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Lazily resolved type references
const $lazyTypes = [];

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.UnProtos = (function() {

    /**
     * Namespace UnProtos.
     * @exports UnProtos
     * @namespace
     */
    const UnProtos = {};

    UnProtos.Data = (function() {

        /**
         * Namespace Data.
         * @exports UnProtos.Data
         * @namespace
         */
        const Data = {};

        Data.Action = (function() {

            /**
             * Constructs a new Action.
             * @exports UnProtos.Data.Action
             * @constructor
             * @param {Object} [properties] Properties to set
             */
            function Action(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        this[keys[i]] = properties[keys[i]];
            }

            /**
             * Action position.
             * @type {UnProtos.Data.Vec3|undefined}
             */
            Action.prototype.position = null;

            /**
             * Action motion.
             * @type {UnProtos.Data.Vec3|undefined}
             */
            Action.prototype.motion = null;

            /**
             * Action angle.
             * @type {number|undefined}
             */
            Action.prototype.angle = 0;

            /**
             * Action slew.
             * @type {number|undefined}
             */
            Action.prototype.slew = 0;

            // Lazily resolved type references
            const $types = {
                0: "UnProtos.Data.Vec3",
                1: "UnProtos.Data.Vec3"
            }; $lazyTypes.push($types);

            /**
             * Creates a new Action instance using the specified properties.
             * @param {Object} [properties] Properties to set
             * @returns {UnProtos.Data.Action} Action instance
             */
            Action.create = function create(properties) {
                return new Action(properties);
            };

            /**
             * Encodes the specified Action message.
             * @param {UnProtos.Data.Action|Object} message Action message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Action.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.position && message.hasOwnProperty("position"))
                    $types[0].encode(message.position, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.motion && message.hasOwnProperty("motion"))
                    $types[1].encode(message.motion, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.angle !== undefined && message.hasOwnProperty("angle"))
                    writer.uint32(/* id 3, wireType 1 =*/25).double(message.angle);
                if (message.slew !== undefined && message.hasOwnProperty("slew"))
                    writer.uint32(/* id 4, wireType 1 =*/33).double(message.slew);
                return writer;
            };

            /**
             * Encodes the specified Action message, length delimited.
             * @param {UnProtos.Data.Action|Object} message Action message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Action.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Action message from the specified reader or buffer.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UnProtos.Data.Action} Action
             */
            Action.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.UnProtos.Data.Action();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.position = $types[0].decode(reader, reader.uint32());
                        break;
                    case 2:
                        message.motion = $types[1].decode(reader, reader.uint32());
                        break;
                    case 3:
                        message.angle = reader.double();
                        break;
                    case 4:
                        message.slew = reader.double();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Action message from the specified reader or buffer, length delimited.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UnProtos.Data.Action} Action
             */
            Action.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Action message.
             * @param {UnProtos.Data.Action|Object} message Action message or plain object to verify
             * @returns {?string} `null` if valid, otherwise the reason why it is not
             */
            Action.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.position !== undefined && message.position !== null) {
                    let error = $types[0].verify(message.position);
                    if (error)
                        return "position." + error;
                }
                if (message.motion !== undefined && message.motion !== null) {
                    let error = $types[1].verify(message.motion);
                    if (error)
                        return "motion." + error;
                }
                if (message.angle !== undefined)
                    if (typeof message.angle !== "number")
                        return "angle: number expected";
                if (message.slew !== undefined)
                    if (typeof message.slew !== "number")
                        return "slew: number expected";
                return null;
            };

            /**
             * Creates an Action message from a plain object. Also converts values to their respective internal types.
             * @param {Object.<string,*>} object Plain object
             * @returns {UnProtos.Data.Action} Action
             */
            Action.fromObject = function fromObject(object) {
                if (object instanceof $root.UnProtos.Data.Action)
                    return object;
                let message = new $root.UnProtos.Data.Action();
                if (object.position !== undefined && object.position !== null) {
                    if (typeof object.position !== "object")
                        throw TypeError(".UnProtos.Data.Action.position: object expected");
                    message.position = $types[0].fromObject(object.position);
                }
                if (object.motion !== undefined && object.motion !== null) {
                    if (typeof object.motion !== "object")
                        throw TypeError(".UnProtos.Data.Action.motion: object expected");
                    message.motion = $types[1].fromObject(object.motion);
                }
                if (object.angle !== undefined && object.angle !== null)
                    message.angle = Number(object.angle);
                if (object.slew !== undefined && object.slew !== null)
                    message.slew = Number(object.slew);
                return message;
            };

            /**
             * Creates an Action message from a plain object. Also converts values to their respective internal types.
             * This is an alias of {@link UnProtos.Data.Action.fromObject}.
             * @function
             * @param {Object.<string,*>} object Plain object
             * @returns {UnProtos.Data.Action} Action
             */
            Action.from = Action.fromObject;

            /**
             * Creates a plain object from an Action message. Also converts values to other types if specified.
             * @param {UnProtos.Data.Action} message Action
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Action.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.position = null;
                    object.motion = null;
                    object.angle = 0;
                    object.slew = 0;
                }
                if (message.position !== undefined && message.position !== null && message.hasOwnProperty("position"))
                    object.position = $types[0].toObject(message.position, options);
                if (message.motion !== undefined && message.motion !== null && message.hasOwnProperty("motion"))
                    object.motion = $types[1].toObject(message.motion, options);
                if (message.angle !== undefined && message.angle !== null && message.hasOwnProperty("angle"))
                    object.angle = message.angle;
                if (message.slew !== undefined && message.slew !== null && message.hasOwnProperty("slew"))
                    object.slew = message.slew;
                return object;
            };

            /**
             * Creates a plain object from this Action message. Also converts values to other types if specified.
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Action.prototype.toObject = function toObject(options) {
                return this.constructor.toObject(this, options);
            };

            /**
             * Converts this Action to JSON.
             * @returns {Object.<string,*>} JSON object
             */
            Action.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Action;
        })();

        Data.Vec3 = (function() {

            /**
             * Constructs a new Vec3.
             * @exports UnProtos.Data.Vec3
             * @constructor
             * @param {Object} [properties] Properties to set
             */
            function Vec3(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        this[keys[i]] = properties[keys[i]];
            }

            /**
             * Vec3 x.
             * @type {number|undefined}
             */
            Vec3.prototype.x = 0;

            /**
             * Vec3 y.
             * @type {number|undefined}
             */
            Vec3.prototype.y = 0;

            /**
             * Vec3 z.
             * @type {number|undefined}
             */
            Vec3.prototype.z = 0;

            /**
             * Creates a new Vec3 instance using the specified properties.
             * @param {Object} [properties] Properties to set
             * @returns {UnProtos.Data.Vec3} Vec3 instance
             */
            Vec3.create = function create(properties) {
                return new Vec3(properties);
            };

            /**
             * Encodes the specified Vec3 message.
             * @param {UnProtos.Data.Vec3|Object} message Vec3 message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Vec3.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.x !== undefined && message.hasOwnProperty("x"))
                    writer.uint32(/* id 1, wireType 1 =*/9).double(message.x);
                if (message.y !== undefined && message.hasOwnProperty("y"))
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.y);
                if (message.z !== undefined && message.hasOwnProperty("z"))
                    writer.uint32(/* id 3, wireType 1 =*/25).double(message.z);
                return writer;
            };

            /**
             * Encodes the specified Vec3 message, length delimited.
             * @param {UnProtos.Data.Vec3|Object} message Vec3 message or plain object to encode
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
             * @returns {UnProtos.Data.Vec3} Vec3
             */
            Vec3.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.UnProtos.Data.Vec3();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.x = reader.double();
                        break;
                    case 2:
                        message.y = reader.double();
                        break;
                    case 3:
                        message.z = reader.double();
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
             * @returns {UnProtos.Data.Vec3} Vec3
             */
            Vec3.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Vec3 message.
             * @param {UnProtos.Data.Vec3|Object} message Vec3 message or plain object to verify
             * @returns {?string} `null` if valid, otherwise the reason why it is not
             */
            Vec3.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.x !== undefined)
                    if (typeof message.x !== "number")
                        return "x: number expected";
                if (message.y !== undefined)
                    if (typeof message.y !== "number")
                        return "y: number expected";
                if (message.z !== undefined)
                    if (typeof message.z !== "number")
                        return "z: number expected";
                return null;
            };

            /**
             * Creates a Vec3 message from a plain object. Also converts values to their respective internal types.
             * @param {Object.<string,*>} object Plain object
             * @returns {UnProtos.Data.Vec3} Vec3
             */
            Vec3.fromObject = function fromObject(object) {
                if (object instanceof $root.UnProtos.Data.Vec3)
                    return object;
                let message = new $root.UnProtos.Data.Vec3();
                if (object.x !== undefined && object.x !== null)
                    message.x = Number(object.x);
                if (object.y !== undefined && object.y !== null)
                    message.y = Number(object.y);
                if (object.z !== undefined && object.z !== null)
                    message.z = Number(object.z);
                return message;
            };

            /**
             * Creates a Vec3 message from a plain object. Also converts values to their respective internal types.
             * This is an alias of {@link UnProtos.Data.Vec3.fromObject}.
             * @function
             * @param {Object.<string,*>} object Plain object
             * @returns {UnProtos.Data.Vec3} Vec3
             */
            Vec3.from = Vec3.fromObject;

            /**
             * Creates a plain object from a Vec3 message. Also converts values to other types if specified.
             * @param {UnProtos.Data.Vec3} message Vec3
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Vec3.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.x = 0;
                    object.y = 0;
                    object.z = 0;
                }
                if (message.x !== undefined && message.x !== null && message.hasOwnProperty("x"))
                    object.x = message.x;
                if (message.y !== undefined && message.y !== null && message.hasOwnProperty("y"))
                    object.y = message.y;
                if (message.z !== undefined && message.z !== null && message.hasOwnProperty("z"))
                    object.z = message.z;
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

        return Data;
    })();

    UnProtos.Messaging = (function() {

        /**
         * Namespace Messaging.
         * @exports UnProtos.Messaging
         * @namespace
         */
        const Messaging = {};

        Messaging.Message = (function() {

            /**
             * Constructs a new Message.
             * @exports UnProtos.Messaging.Message
             * @constructor
             * @param {Object} [properties] Properties to set
             */
            function Message(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        this[keys[i]] = properties[keys[i]];
            }

            /**
             * Message type.
             * @type {number|undefined}
             */
            Message.prototype.type = 0;

            /**
             * Message body.
             * @type {Uint8Array|undefined}
             */
            Message.prototype.body = $util.newBuffer([]);

            // Lazily resolved type references
            const $types = {
                0: "UnProtos.Messaging.MessageType"
            }; $lazyTypes.push($types);

            /**
             * Creates a new Message instance using the specified properties.
             * @param {Object} [properties] Properties to set
             * @returns {UnProtos.Messaging.Message} Message instance
             */
            Message.create = function create(properties) {
                return new Message(properties);
            };

            /**
             * Encodes the specified Message message.
             * @param {UnProtos.Messaging.Message|Object} message Message message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Message.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type !== undefined && message.hasOwnProperty("type"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.type);
                if (message.body && message.hasOwnProperty("body"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.body);
                return writer;
            };

            /**
             * Encodes the specified Message message, length delimited.
             * @param {UnProtos.Messaging.Message|Object} message Message message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Message.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Message message from the specified reader or buffer.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UnProtos.Messaging.Message} Message
             */
            Message.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.UnProtos.Messaging.Message();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.type = reader.uint32();
                        break;
                    case 2:
                        message.body = reader.bytes();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Message message from the specified reader or buffer, length delimited.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UnProtos.Messaging.Message} Message
             */
            Message.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Message message.
             * @param {UnProtos.Messaging.Message|Object} message Message message or plain object to verify
             * @returns {?string} `null` if valid, otherwise the reason why it is not
             */
            Message.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type !== undefined)
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 2:
                    case 4:
                        break;
                    }
                if (message.body !== undefined)
                    if (!(message.body && typeof message.body.length === "number" || $util.isString(message.body)))
                        return "body: buffer expected";
                return null;
            };

            /**
             * Creates a Message message from a plain object. Also converts values to their respective internal types.
             * @param {Object.<string,*>} object Plain object
             * @returns {UnProtos.Messaging.Message} Message
             */
            Message.fromObject = function fromObject(object) {
                if (object instanceof $root.UnProtos.Messaging.Message)
                    return object;
                let message = new $root.UnProtos.Messaging.Message();
                switch (object.type) {
                case "APPLY_CONTROLLER":
                case 0:
                    message.type = 0;
                    break;
                case "GET_TERRAIN":
                case 2:
                    message.type = 2;
                    break;
                case "GET_CHUNK":
                case 4:
                    message.type = 4;
                    break;
                }
                if (object.body !== undefined && object.body !== null)
                    if (typeof object.body === "string")
                        $util.base64.decode(object.body, message.body = $util.newBuffer($util.base64.length(object.body)), 0);
                    else if (object.body.length)
                        message.body = object.body;
                return message;
            };

            /**
             * Creates a Message message from a plain object. Also converts values to their respective internal types.
             * This is an alias of {@link UnProtos.Messaging.Message.fromObject}.
             * @function
             * @param {Object.<string,*>} object Plain object
             * @returns {UnProtos.Messaging.Message} Message
             */
            Message.from = Message.fromObject;

            /**
             * Creates a plain object from a Message message. Also converts values to other types if specified.
             * @param {UnProtos.Messaging.Message} message Message
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Message.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.type = options.enums === String ? "APPLY_CONTROLLER" : 0;
                    object.body = options.bytes === String ? "" : [];
                }
                if (message.type !== undefined && message.type !== null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $types[0][message.type] : message.type;
                if (message.body !== undefined && message.body !== null && message.hasOwnProperty("body"))
                    object.body = options.bytes === String ? $util.base64.encode(message.body, 0, message.body.length) : options.bytes === Array ? Array.prototype.slice.call(message.body) : message.body;
                return object;
            };

            /**
             * Creates a plain object from this Message message. Also converts values to other types if specified.
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Message.prototype.toObject = function toObject(options) {
                return this.constructor.toObject(this, options);
            };

            /**
             * Converts this Message to JSON.
             * @returns {Object.<string,*>} JSON object
             */
            Message.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Message;
        })();

        /**
         * MessageType enum.
         * @name MessageType
         * @memberof UnProtos.Messaging
         * @enum {number}
         * @property {number} APPLY_CONTROLLER=0 APPLY_CONTROLLER value
         * @property {number} GET_TERRAIN=2 GET_TERRAIN value
         * @property {number} GET_CHUNK=4 GET_CHUNK value
         */
        Messaging.MessageType = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values["APPLY_CONTROLLER"] = 0;
            values["GET_TERRAIN"] = 2;
            values["GET_CHUNK"] = 4;
            return values;
        })();

        Messaging.Requests = (function() {

            /**
             * Namespace Requests.
             * @exports UnProtos.Messaging.Requests
             * @namespace
             */
            const Requests = {};

            Requests.ApplyControllerRequest = (function() {

                /**
                 * Constructs a new ApplyControllerRequest.
                 * @exports UnProtos.Messaging.Requests.ApplyControllerRequest
                 * @constructor
                 * @param {Object} [properties] Properties to set
                 */
                function ApplyControllerRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ApplyControllerRequest moveForward.
                 * @type {boolean|undefined}
                 */
                ApplyControllerRequest.prototype.moveForward = false;

                /**
                 * ApplyControllerRequest moveBackward.
                 * @type {boolean|undefined}
                 */
                ApplyControllerRequest.prototype.moveBackward = false;

                /**
                 * ApplyControllerRequest moveLeft.
                 * @type {boolean|undefined}
                 */
                ApplyControllerRequest.prototype.moveLeft = false;

                /**
                 * ApplyControllerRequest moveRight.
                 * @type {boolean|undefined}
                 */
                ApplyControllerRequest.prototype.moveRight = false;

                /**
                 * ApplyControllerRequest rotateLeft.
                 * @type {boolean|undefined}
                 */
                ApplyControllerRequest.prototype.rotateLeft = false;

                /**
                 * ApplyControllerRequest rotateRight.
                 * @type {boolean|undefined}
                 */
                ApplyControllerRequest.prototype.rotateRight = false;

                /**
                 * ApplyControllerRequest mods.
                 * @type {UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers|undefined}
                 */
                ApplyControllerRequest.prototype.mods = null;

                // Lazily resolved type references
                const $types = {
                    6: "UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers"
                }; $lazyTypes.push($types);

                /**
                 * Creates a new ApplyControllerRequest instance using the specified properties.
                 * @param {Object} [properties] Properties to set
                 * @returns {UnProtos.Messaging.Requests.ApplyControllerRequest} ApplyControllerRequest instance
                 */
                ApplyControllerRequest.create = function create(properties) {
                    return new ApplyControllerRequest(properties);
                };

                /**
                 * Encodes the specified ApplyControllerRequest message.
                 * @param {UnProtos.Messaging.Requests.ApplyControllerRequest|Object} message ApplyControllerRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ApplyControllerRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.moveForward !== undefined && message.hasOwnProperty("moveForward"))
                        writer.uint32(/* id 1, wireType 0 =*/8).bool(message.moveForward);
                    if (message.moveBackward !== undefined && message.hasOwnProperty("moveBackward"))
                        writer.uint32(/* id 2, wireType 0 =*/16).bool(message.moveBackward);
                    if (message.moveLeft !== undefined && message.hasOwnProperty("moveLeft"))
                        writer.uint32(/* id 3, wireType 0 =*/24).bool(message.moveLeft);
                    if (message.moveRight !== undefined && message.hasOwnProperty("moveRight"))
                        writer.uint32(/* id 4, wireType 0 =*/32).bool(message.moveRight);
                    if (message.rotateLeft !== undefined && message.hasOwnProperty("rotateLeft"))
                        writer.uint32(/* id 5, wireType 0 =*/40).bool(message.rotateLeft);
                    if (message.rotateRight !== undefined && message.hasOwnProperty("rotateRight"))
                        writer.uint32(/* id 6, wireType 0 =*/48).bool(message.rotateRight);
                    if (message.mods && message.hasOwnProperty("mods"))
                        $types[6].encode(message.mods, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ApplyControllerRequest message, length delimited.
                 * @param {UnProtos.Messaging.Requests.ApplyControllerRequest|Object} message ApplyControllerRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ApplyControllerRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an ApplyControllerRequest message from the specified reader or buffer.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {UnProtos.Messaging.Requests.ApplyControllerRequest} ApplyControllerRequest
                 */
                ApplyControllerRequest.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.UnProtos.Messaging.Requests.ApplyControllerRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.moveForward = reader.bool();
                            break;
                        case 2:
                            message.moveBackward = reader.bool();
                            break;
                        case 3:
                            message.moveLeft = reader.bool();
                            break;
                        case 4:
                            message.moveRight = reader.bool();
                            break;
                        case 5:
                            message.rotateLeft = reader.bool();
                            break;
                        case 6:
                            message.rotateRight = reader.bool();
                            break;
                        case 7:
                            message.mods = $types[6].decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an ApplyControllerRequest message from the specified reader or buffer, length delimited.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {UnProtos.Messaging.Requests.ApplyControllerRequest} ApplyControllerRequest
                 */
                ApplyControllerRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an ApplyControllerRequest message.
                 * @param {UnProtos.Messaging.Requests.ApplyControllerRequest|Object} message ApplyControllerRequest message or plain object to verify
                 * @returns {?string} `null` if valid, otherwise the reason why it is not
                 */
                ApplyControllerRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.moveForward !== undefined)
                        if (typeof message.moveForward !== "boolean")
                            return "moveForward: boolean expected";
                    if (message.moveBackward !== undefined)
                        if (typeof message.moveBackward !== "boolean")
                            return "moveBackward: boolean expected";
                    if (message.moveLeft !== undefined)
                        if (typeof message.moveLeft !== "boolean")
                            return "moveLeft: boolean expected";
                    if (message.moveRight !== undefined)
                        if (typeof message.moveRight !== "boolean")
                            return "moveRight: boolean expected";
                    if (message.rotateLeft !== undefined)
                        if (typeof message.rotateLeft !== "boolean")
                            return "rotateLeft: boolean expected";
                    if (message.rotateRight !== undefined)
                        if (typeof message.rotateRight !== "boolean")
                            return "rotateRight: boolean expected";
                    if (message.mods !== undefined && message.mods !== null) {
                        let error = $types[6].verify(message.mods);
                        if (error)
                            return "mods." + error;
                    }
                    return null;
                };

                /**
                 * Creates an ApplyControllerRequest message from a plain object. Also converts values to their respective internal types.
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Requests.ApplyControllerRequest} ApplyControllerRequest
                 */
                ApplyControllerRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.UnProtos.Messaging.Requests.ApplyControllerRequest)
                        return object;
                    let message = new $root.UnProtos.Messaging.Requests.ApplyControllerRequest();
                    if (object.moveForward !== undefined && object.moveForward !== null)
                        message.moveForward = Boolean(object.moveForward);
                    if (object.moveBackward !== undefined && object.moveBackward !== null)
                        message.moveBackward = Boolean(object.moveBackward);
                    if (object.moveLeft !== undefined && object.moveLeft !== null)
                        message.moveLeft = Boolean(object.moveLeft);
                    if (object.moveRight !== undefined && object.moveRight !== null)
                        message.moveRight = Boolean(object.moveRight);
                    if (object.rotateLeft !== undefined && object.rotateLeft !== null)
                        message.rotateLeft = Boolean(object.rotateLeft);
                    if (object.rotateRight !== undefined && object.rotateRight !== null)
                        message.rotateRight = Boolean(object.rotateRight);
                    if (object.mods !== undefined && object.mods !== null) {
                        if (typeof object.mods !== "object")
                            throw TypeError(".UnProtos.Messaging.Requests.ApplyControllerRequest.mods: object expected");
                        message.mods = $types[6].fromObject(object.mods);
                    }
                    return message;
                };

                /**
                 * Creates an ApplyControllerRequest message from a plain object. Also converts values to their respective internal types.
                 * This is an alias of {@link UnProtos.Messaging.Requests.ApplyControllerRequest.fromObject}.
                 * @function
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Requests.ApplyControllerRequest} ApplyControllerRequest
                 */
                ApplyControllerRequest.from = ApplyControllerRequest.fromObject;

                /**
                 * Creates a plain object from an ApplyControllerRequest message. Also converts values to other types if specified.
                 * @param {UnProtos.Messaging.Requests.ApplyControllerRequest} message ApplyControllerRequest
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ApplyControllerRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.moveForward = false;
                        object.moveBackward = false;
                        object.moveLeft = false;
                        object.moveRight = false;
                        object.rotateLeft = false;
                        object.rotateRight = false;
                        object.mods = null;
                    }
                    if (message.moveForward !== undefined && message.moveForward !== null && message.hasOwnProperty("moveForward"))
                        object.moveForward = message.moveForward;
                    if (message.moveBackward !== undefined && message.moveBackward !== null && message.hasOwnProperty("moveBackward"))
                        object.moveBackward = message.moveBackward;
                    if (message.moveLeft !== undefined && message.moveLeft !== null && message.hasOwnProperty("moveLeft"))
                        object.moveLeft = message.moveLeft;
                    if (message.moveRight !== undefined && message.moveRight !== null && message.hasOwnProperty("moveRight"))
                        object.moveRight = message.moveRight;
                    if (message.rotateLeft !== undefined && message.rotateLeft !== null && message.hasOwnProperty("rotateLeft"))
                        object.rotateLeft = message.rotateLeft;
                    if (message.rotateRight !== undefined && message.rotateRight !== null && message.hasOwnProperty("rotateRight"))
                        object.rotateRight = message.rotateRight;
                    if (message.mods !== undefined && message.mods !== null && message.hasOwnProperty("mods"))
                        object.mods = $types[6].toObject(message.mods, options);
                    return object;
                };

                /**
                 * Creates a plain object from this ApplyControllerRequest message. Also converts values to other types if specified.
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ApplyControllerRequest.prototype.toObject = function toObject(options) {
                    return this.constructor.toObject(this, options);
                };

                /**
                 * Converts this ApplyControllerRequest to JSON.
                 * @returns {Object.<string,*>} JSON object
                 */
                ApplyControllerRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                ApplyControllerRequest.Modifiers = (function() {

                    /**
                     * Constructs a new Modifiers.
                     * @exports UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers
                     * @constructor
                     * @param {Object} [properties] Properties to set
                     */
                    function Modifiers(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Modifiers shift.
                     * @type {boolean|undefined}
                     */
                    Modifiers.prototype.shift = false;

                    /**
                     * Modifiers ctrl.
                     * @type {boolean|undefined}
                     */
                    Modifiers.prototype.ctrl = false;

                    /**
                     * Modifiers alt.
                     * @type {boolean|undefined}
                     */
                    Modifiers.prototype.alt = false;

                    /**
                     * Modifiers meta.
                     * @type {boolean|undefined}
                     */
                    Modifiers.prototype.meta = false;

                    /**
                     * Creates a new Modifiers instance using the specified properties.
                     * @param {Object} [properties] Properties to set
                     * @returns {UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers} Modifiers instance
                     */
                    Modifiers.create = function create(properties) {
                        return new Modifiers(properties);
                    };

                    /**
                     * Encodes the specified Modifiers message.
                     * @param {UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers|Object} message Modifiers message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Modifiers.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.shift !== undefined && message.hasOwnProperty("shift"))
                            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.shift);
                        if (message.ctrl !== undefined && message.hasOwnProperty("ctrl"))
                            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.ctrl);
                        if (message.alt !== undefined && message.hasOwnProperty("alt"))
                            writer.uint32(/* id 3, wireType 0 =*/24).bool(message.alt);
                        if (message.meta !== undefined && message.hasOwnProperty("meta"))
                            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.meta);
                        return writer;
                    };

                    /**
                     * Encodes the specified Modifiers message, length delimited.
                     * @param {UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers|Object} message Modifiers message or plain object to encode
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
                     * @returns {UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers} Modifiers
                     */
                    Modifiers.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message.shift = reader.bool();
                                break;
                            case 2:
                                message.ctrl = reader.bool();
                                break;
                            case 3:
                                message.alt = reader.bool();
                                break;
                            case 4:
                                message.meta = reader.bool();
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
                     * @returns {UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers} Modifiers
                     */
                    Modifiers.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Modifiers message.
                     * @param {UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers|Object} message Modifiers message or plain object to verify
                     * @returns {?string} `null` if valid, otherwise the reason why it is not
                     */
                    Modifiers.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.shift !== undefined)
                            if (typeof message.shift !== "boolean")
                                return "shift: boolean expected";
                        if (message.ctrl !== undefined)
                            if (typeof message.ctrl !== "boolean")
                                return "ctrl: boolean expected";
                        if (message.alt !== undefined)
                            if (typeof message.alt !== "boolean")
                                return "alt: boolean expected";
                        if (message.meta !== undefined)
                            if (typeof message.meta !== "boolean")
                                return "meta: boolean expected";
                        return null;
                    };

                    /**
                     * Creates a Modifiers message from a plain object. Also converts values to their respective internal types.
                     * @param {Object.<string,*>} object Plain object
                     * @returns {UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers} Modifiers
                     */
                    Modifiers.fromObject = function fromObject(object) {
                        if (object instanceof $root.UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers)
                            return object;
                        let message = new $root.UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers();
                        if (object.shift !== undefined && object.shift !== null)
                            message.shift = Boolean(object.shift);
                        if (object.ctrl !== undefined && object.ctrl !== null)
                            message.ctrl = Boolean(object.ctrl);
                        if (object.alt !== undefined && object.alt !== null)
                            message.alt = Boolean(object.alt);
                        if (object.meta !== undefined && object.meta !== null)
                            message.meta = Boolean(object.meta);
                        return message;
                    };

                    /**
                     * Creates a Modifiers message from a plain object. Also converts values to their respective internal types.
                     * This is an alias of {@link UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers.fromObject}.
                     * @function
                     * @param {Object.<string,*>} object Plain object
                     * @returns {UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers} Modifiers
                     */
                    Modifiers.from = Modifiers.fromObject;

                    /**
                     * Creates a plain object from a Modifiers message. Also converts values to other types if specified.
                     * @param {UnProtos.Messaging.Requests.ApplyControllerRequest.Modifiers} message Modifiers
                     * @param {$protobuf.ConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Modifiers.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.shift = false;
                            object.ctrl = false;
                            object.alt = false;
                            object.meta = false;
                        }
                        if (message.shift !== undefined && message.shift !== null && message.hasOwnProperty("shift"))
                            object.shift = message.shift;
                        if (message.ctrl !== undefined && message.ctrl !== null && message.hasOwnProperty("ctrl"))
                            object.ctrl = message.ctrl;
                        if (message.alt !== undefined && message.alt !== null && message.hasOwnProperty("alt"))
                            object.alt = message.alt;
                        if (message.meta !== undefined && message.meta !== null && message.hasOwnProperty("meta"))
                            object.meta = message.meta;
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

                return ApplyControllerRequest;
            })();

            Requests.GetChunkRequest = (function() {

                /**
                 * Constructs a new GetChunkRequest.
                 * @exports UnProtos.Messaging.Requests.GetChunkRequest
                 * @constructor
                 * @param {Object} [properties] Properties to set
                 */
                function GetChunkRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            this[keys[i]] = properties[keys[i]];
                }

                /**
                 * GetChunkRequest chunks.
                 * @type {Array.<number>|undefined}
                 */
                GetChunkRequest.prototype.chunks = $util.emptyArray;

                /**
                 * Creates a new GetChunkRequest instance using the specified properties.
                 * @param {Object} [properties] Properties to set
                 * @returns {UnProtos.Messaging.Requests.GetChunkRequest} GetChunkRequest instance
                 */
                GetChunkRequest.create = function create(properties) {
                    return new GetChunkRequest(properties);
                };

                /**
                 * Encodes the specified GetChunkRequest message.
                 * @param {UnProtos.Messaging.Requests.GetChunkRequest|Object} message GetChunkRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GetChunkRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.chunks && message.chunks.length && message.hasOwnProperty("chunks")) {
                        writer.uint32(/* id 1, wireType 2 =*/10).fork();
                        for (let i = 0; i < message.chunks.length; ++i)
                            writer.int32(message.chunks[i]);
                        writer.ldelim();
                    }
                    return writer;
                };

                /**
                 * Encodes the specified GetChunkRequest message, length delimited.
                 * @param {UnProtos.Messaging.Requests.GetChunkRequest|Object} message GetChunkRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GetChunkRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a GetChunkRequest message from the specified reader or buffer.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {UnProtos.Messaging.Requests.GetChunkRequest} GetChunkRequest
                 */
                GetChunkRequest.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.UnProtos.Messaging.Requests.GetChunkRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            if (!(message.chunks && message.chunks.length))
                                message.chunks = [];
                            if ((tag & 7) === 2) {
                                let end2 = reader.uint32() + reader.pos;
                                while (reader.pos < end2)
                                    message.chunks.push(reader.int32());
                            } else
                                message.chunks.push(reader.int32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a GetChunkRequest message from the specified reader or buffer, length delimited.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {UnProtos.Messaging.Requests.GetChunkRequest} GetChunkRequest
                 */
                GetChunkRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a GetChunkRequest message.
                 * @param {UnProtos.Messaging.Requests.GetChunkRequest|Object} message GetChunkRequest message or plain object to verify
                 * @returns {?string} `null` if valid, otherwise the reason why it is not
                 */
                GetChunkRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.chunks !== undefined) {
                        if (!Array.isArray(message.chunks))
                            return "chunks: array expected";
                        for (let i = 0; i < message.chunks.length; ++i)
                            if (!$util.isInteger(message.chunks[i]))
                                return "chunks: integer[] expected";
                    }
                    return null;
                };

                /**
                 * Creates a GetChunkRequest message from a plain object. Also converts values to their respective internal types.
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Requests.GetChunkRequest} GetChunkRequest
                 */
                GetChunkRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.UnProtos.Messaging.Requests.GetChunkRequest)
                        return object;
                    let message = new $root.UnProtos.Messaging.Requests.GetChunkRequest();
                    if (object.chunks) {
                        if (!Array.isArray(object.chunks))
                            throw TypeError(".UnProtos.Messaging.Requests.GetChunkRequest.chunks: array expected");
                        message.chunks = [];
                        for (let i = 0; i < object.chunks.length; ++i)
                            message.chunks[i] = object.chunks[i] | 0;
                    }
                    return message;
                };

                /**
                 * Creates a GetChunkRequest message from a plain object. Also converts values to their respective internal types.
                 * This is an alias of {@link UnProtos.Messaging.Requests.GetChunkRequest.fromObject}.
                 * @function
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Requests.GetChunkRequest} GetChunkRequest
                 */
                GetChunkRequest.from = GetChunkRequest.fromObject;

                /**
                 * Creates a plain object from a GetChunkRequest message. Also converts values to other types if specified.
                 * @param {UnProtos.Messaging.Requests.GetChunkRequest} message GetChunkRequest
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GetChunkRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.chunks = [];
                    if (message.chunks !== undefined && message.chunks !== null && message.hasOwnProperty("chunks")) {
                        object.chunks = [];
                        for (let j = 0; j < message.chunks.length; ++j)
                            object.chunks[j] = message.chunks[j];
                    }
                    return object;
                };

                /**
                 * Creates a plain object from this GetChunkRequest message. Also converts values to other types if specified.
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GetChunkRequest.prototype.toObject = function toObject(options) {
                    return this.constructor.toObject(this, options);
                };

                /**
                 * Converts this GetChunkRequest to JSON.
                 * @returns {Object.<string,*>} JSON object
                 */
                GetChunkRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return GetChunkRequest;
            })();

            Requests.GetTerrainRequest = (function() {

                /**
                 * Constructs a new GetTerrainRequest.
                 * @exports UnProtos.Messaging.Requests.GetTerrainRequest
                 * @constructor
                 * @param {Object} [properties] Properties to set
                 */
                function GetTerrainRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new GetTerrainRequest instance using the specified properties.
                 * @param {Object} [properties] Properties to set
                 * @returns {UnProtos.Messaging.Requests.GetTerrainRequest} GetTerrainRequest instance
                 */
                GetTerrainRequest.create = function create(properties) {
                    return new GetTerrainRequest(properties);
                };

                /**
                 * Encodes the specified GetTerrainRequest message.
                 * @param {UnProtos.Messaging.Requests.GetTerrainRequest|Object} message GetTerrainRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GetTerrainRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified GetTerrainRequest message, length delimited.
                 * @param {UnProtos.Messaging.Requests.GetTerrainRequest|Object} message GetTerrainRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GetTerrainRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a GetTerrainRequest message from the specified reader or buffer.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {UnProtos.Messaging.Requests.GetTerrainRequest} GetTerrainRequest
                 */
                GetTerrainRequest.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.UnProtos.Messaging.Requests.GetTerrainRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a GetTerrainRequest message from the specified reader or buffer, length delimited.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {UnProtos.Messaging.Requests.GetTerrainRequest} GetTerrainRequest
                 */
                GetTerrainRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a GetTerrainRequest message.
                 * @param {UnProtos.Messaging.Requests.GetTerrainRequest|Object} message GetTerrainRequest message or plain object to verify
                 * @returns {?string} `null` if valid, otherwise the reason why it is not
                 */
                GetTerrainRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates a GetTerrainRequest message from a plain object. Also converts values to their respective internal types.
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Requests.GetTerrainRequest} GetTerrainRequest
                 */
                GetTerrainRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.UnProtos.Messaging.Requests.GetTerrainRequest)
                        return object;
                    return new $root.UnProtos.Messaging.Requests.GetTerrainRequest();
                };

                /**
                 * Creates a GetTerrainRequest message from a plain object. Also converts values to their respective internal types.
                 * This is an alias of {@link UnProtos.Messaging.Requests.GetTerrainRequest.fromObject}.
                 * @function
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Requests.GetTerrainRequest} GetTerrainRequest
                 */
                GetTerrainRequest.from = GetTerrainRequest.fromObject;

                /**
                 * Creates a plain object from a GetTerrainRequest message. Also converts values to other types if specified.
                 * @param {UnProtos.Messaging.Requests.GetTerrainRequest} message GetTerrainRequest
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GetTerrainRequest.toObject = function toObject() {
                    return {};
                };

                /**
                 * Creates a plain object from this GetTerrainRequest message. Also converts values to other types if specified.
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GetTerrainRequest.prototype.toObject = function toObject(options) {
                    return this.constructor.toObject(this, options);
                };

                /**
                 * Converts this GetTerrainRequest to JSON.
                 * @returns {Object.<string,*>} JSON object
                 */
                GetTerrainRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return GetTerrainRequest;
            })();

            return Requests;
        })();

        Messaging.Responses = (function() {

            /**
             * Namespace Responses.
             * @exports UnProtos.Messaging.Responses
             * @namespace
             */
            const Responses = {};

            Responses.ApplyControllerResponse = (function() {

                /**
                 * Constructs a new ApplyControllerResponse.
                 * @exports UnProtos.Messaging.Responses.ApplyControllerResponse
                 * @constructor
                 * @param {Object} [properties] Properties to set
                 */
                function ApplyControllerResponse(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ApplyControllerResponse result.
                 * @type {number|undefined}
                 */
                ApplyControllerResponse.prototype.result = 0;

                /**
                 * ApplyControllerResponse action.
                 * @type {UnProtos.Data.Action|undefined}
                 */
                ApplyControllerResponse.prototype.action = null;

                // Lazily resolved type references
                const $types = {
                    0: "UnProtos.Messaging.Responses.ApplyControllerResponse.Result",
                    1: "UnProtos.Data.Action"
                }; $lazyTypes.push($types);

                /**
                 * Creates a new ApplyControllerResponse instance using the specified properties.
                 * @param {Object} [properties] Properties to set
                 * @returns {UnProtos.Messaging.Responses.ApplyControllerResponse} ApplyControllerResponse instance
                 */
                ApplyControllerResponse.create = function create(properties) {
                    return new ApplyControllerResponse(properties);
                };

                /**
                 * Encodes the specified ApplyControllerResponse message.
                 * @param {UnProtos.Messaging.Responses.ApplyControllerResponse|Object} message ApplyControllerResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ApplyControllerResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.result !== undefined && message.hasOwnProperty("result"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.result);
                    if (message.action && message.hasOwnProperty("action"))
                        $types[1].encode(message.action, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ApplyControllerResponse message, length delimited.
                 * @param {UnProtos.Messaging.Responses.ApplyControllerResponse|Object} message ApplyControllerResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ApplyControllerResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an ApplyControllerResponse message from the specified reader or buffer.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {UnProtos.Messaging.Responses.ApplyControllerResponse} ApplyControllerResponse
                 */
                ApplyControllerResponse.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.UnProtos.Messaging.Responses.ApplyControllerResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.result = reader.uint32();
                            break;
                        case 2:
                            message.action = $types[1].decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an ApplyControllerResponse message from the specified reader or buffer, length delimited.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {UnProtos.Messaging.Responses.ApplyControllerResponse} ApplyControllerResponse
                 */
                ApplyControllerResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an ApplyControllerResponse message.
                 * @param {UnProtos.Messaging.Responses.ApplyControllerResponse|Object} message ApplyControllerResponse message or plain object to verify
                 * @returns {?string} `null` if valid, otherwise the reason why it is not
                 */
                ApplyControllerResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.result !== undefined)
                        switch (message.result) {
                        default:
                            return "result: enum value expected";
                        case 0:
                        case 1:
                            break;
                        }
                    if (message.action !== undefined && message.action !== null) {
                        let error = $types[1].verify(message.action);
                        if (error)
                            return "action." + error;
                    }
                    return null;
                };

                /**
                 * Creates an ApplyControllerResponse message from a plain object. Also converts values to their respective internal types.
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Responses.ApplyControllerResponse} ApplyControllerResponse
                 */
                ApplyControllerResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.UnProtos.Messaging.Responses.ApplyControllerResponse)
                        return object;
                    let message = new $root.UnProtos.Messaging.Responses.ApplyControllerResponse();
                    switch (object.result) {
                    case "UNSET":
                    case 0:
                        message.result = 0;
                        break;
                    case "SUCCESS":
                    case 1:
                        message.result = 1;
                        break;
                    }
                    if (object.action !== undefined && object.action !== null) {
                        if (typeof object.action !== "object")
                            throw TypeError(".UnProtos.Messaging.Responses.ApplyControllerResponse.action: object expected");
                        message.action = $types[1].fromObject(object.action);
                    }
                    return message;
                };

                /**
                 * Creates an ApplyControllerResponse message from a plain object. Also converts values to their respective internal types.
                 * This is an alias of {@link UnProtos.Messaging.Responses.ApplyControllerResponse.fromObject}.
                 * @function
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Responses.ApplyControllerResponse} ApplyControllerResponse
                 */
                ApplyControllerResponse.from = ApplyControllerResponse.fromObject;

                /**
                 * Creates a plain object from an ApplyControllerResponse message. Also converts values to other types if specified.
                 * @param {UnProtos.Messaging.Responses.ApplyControllerResponse} message ApplyControllerResponse
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ApplyControllerResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.result = options.enums === String ? "UNSET" : 0;
                        object.action = null;
                    }
                    if (message.result !== undefined && message.result !== null && message.hasOwnProperty("result"))
                        object.result = options.enums === String ? $types[0][message.result] : message.result;
                    if (message.action !== undefined && message.action !== null && message.hasOwnProperty("action"))
                        object.action = $types[1].toObject(message.action, options);
                    return object;
                };

                /**
                 * Creates a plain object from this ApplyControllerResponse message. Also converts values to other types if specified.
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ApplyControllerResponse.prototype.toObject = function toObject(options) {
                    return this.constructor.toObject(this, options);
                };

                /**
                 * Converts this ApplyControllerResponse to JSON.
                 * @returns {Object.<string,*>} JSON object
                 */
                ApplyControllerResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Result enum.
                 * @name Result
                 * @memberof UnProtos.Messaging.Responses.ApplyControllerResponse
                 * @enum {number}
                 * @property {number} UNSET=0 UNSET value
                 * @property {number} SUCCESS=1 SUCCESS value
                 */
                ApplyControllerResponse.Result = (function() {
                    const valuesById = {}, values = Object.create(valuesById);
                    values["UNSET"] = 0;
                    values["SUCCESS"] = 1;
                    return values;
                })();

                return ApplyControllerResponse;
            })();

            Responses.GetChunkResponse = (function() {

                /**
                 * Constructs a new GetChunkResponse.
                 * @exports UnProtos.Messaging.Responses.GetChunkResponse
                 * @constructor
                 * @param {Object} [properties] Properties to set
                 */
                function GetChunkResponse(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            this[keys[i]] = properties[keys[i]];
                }

                /**
                 * GetChunkResponse result.
                 * @type {number|undefined}
                 */
                GetChunkResponse.prototype.result = 0;

                /**
                 * GetChunkResponse index.
                 * @type {number|undefined}
                 */
                GetChunkResponse.prototype.index = 0;

                /**
                 * GetChunkResponse tiles.
                 * @type {Array.<UnProtos.Messaging.Responses.GetChunkResponse.Tile>|undefined}
                 */
                GetChunkResponse.prototype.tiles = $util.emptyArray;

                // Lazily resolved type references
                const $types = {
                    0: "UnProtos.Messaging.Responses.GetChunkResponse.Result",
                    2: "UnProtos.Messaging.Responses.GetChunkResponse.Tile"
                }; $lazyTypes.push($types);

                /**
                 * Creates a new GetChunkResponse instance using the specified properties.
                 * @param {Object} [properties] Properties to set
                 * @returns {UnProtos.Messaging.Responses.GetChunkResponse} GetChunkResponse instance
                 */
                GetChunkResponse.create = function create(properties) {
                    return new GetChunkResponse(properties);
                };

                /**
                 * Encodes the specified GetChunkResponse message.
                 * @param {UnProtos.Messaging.Responses.GetChunkResponse|Object} message GetChunkResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GetChunkResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.result !== undefined && message.hasOwnProperty("result"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.result);
                    if (message.index !== undefined && message.hasOwnProperty("index"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int32(message.index);
                    if (message.tiles !== undefined && message.hasOwnProperty("tiles"))
                        for (let i = 0; i < message.tiles.length; ++i)
                            $types[2].encode(message.tiles[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified GetChunkResponse message, length delimited.
                 * @param {UnProtos.Messaging.Responses.GetChunkResponse|Object} message GetChunkResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GetChunkResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a GetChunkResponse message from the specified reader or buffer.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {UnProtos.Messaging.Responses.GetChunkResponse} GetChunkResponse
                 */
                GetChunkResponse.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.UnProtos.Messaging.Responses.GetChunkResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.result = reader.uint32();
                            break;
                        case 2:
                            message.index = reader.int32();
                            break;
                        case 3:
                            if (!(message.tiles && message.tiles.length))
                                message.tiles = [];
                            message.tiles.push($types[2].decode(reader, reader.uint32()));
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a GetChunkResponse message from the specified reader or buffer, length delimited.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {UnProtos.Messaging.Responses.GetChunkResponse} GetChunkResponse
                 */
                GetChunkResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a GetChunkResponse message.
                 * @param {UnProtos.Messaging.Responses.GetChunkResponse|Object} message GetChunkResponse message or plain object to verify
                 * @returns {?string} `null` if valid, otherwise the reason why it is not
                 */
                GetChunkResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.result !== undefined)
                        switch (message.result) {
                        default:
                            return "result: enum value expected";
                        case 0:
                        case 1:
                            break;
                        }
                    if (message.index !== undefined)
                        if (!$util.isInteger(message.index))
                            return "index: integer expected";
                    if (message.tiles !== undefined) {
                        if (!Array.isArray(message.tiles))
                            return "tiles: array expected";
                        for (let i = 0; i < message.tiles.length; ++i) {
                            let error = $types[2].verify(message.tiles[i]);
                            if (error)
                                return "tiles." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a GetChunkResponse message from a plain object. Also converts values to their respective internal types.
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Responses.GetChunkResponse} GetChunkResponse
                 */
                GetChunkResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.UnProtos.Messaging.Responses.GetChunkResponse)
                        return object;
                    let message = new $root.UnProtos.Messaging.Responses.GetChunkResponse();
                    switch (object.result) {
                    case "UNSET":
                    case 0:
                        message.result = 0;
                        break;
                    case "SUCCESS":
                    case 1:
                        message.result = 1;
                        break;
                    }
                    if (object.index !== undefined && object.index !== null)
                        message.index = object.index | 0;
                    if (object.tiles) {
                        if (!Array.isArray(object.tiles))
                            throw TypeError(".UnProtos.Messaging.Responses.GetChunkResponse.tiles: array expected");
                        message.tiles = [];
                        for (let i = 0; i < object.tiles.length; ++i) {
                            if (typeof object.tiles[i] !== "object")
                                throw TypeError(".UnProtos.Messaging.Responses.GetChunkResponse.tiles: object expected");
                            message.tiles[i] = $types[2].fromObject(object.tiles[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a GetChunkResponse message from a plain object. Also converts values to their respective internal types.
                 * This is an alias of {@link UnProtos.Messaging.Responses.GetChunkResponse.fromObject}.
                 * @function
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Responses.GetChunkResponse} GetChunkResponse
                 */
                GetChunkResponse.from = GetChunkResponse.fromObject;

                /**
                 * Creates a plain object from a GetChunkResponse message. Also converts values to other types if specified.
                 * @param {UnProtos.Messaging.Responses.GetChunkResponse} message GetChunkResponse
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GetChunkResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.tiles = [];
                    if (options.defaults) {
                        object.result = options.enums === String ? "UNSET" : 0;
                        object.index = 0;
                    }
                    if (message.result !== undefined && message.result !== null && message.hasOwnProperty("result"))
                        object.result = options.enums === String ? $types[0][message.result] : message.result;
                    if (message.index !== undefined && message.index !== null && message.hasOwnProperty("index"))
                        object.index = message.index;
                    if (message.tiles !== undefined && message.tiles !== null && message.hasOwnProperty("tiles")) {
                        object.tiles = [];
                        for (let j = 0; j < message.tiles.length; ++j)
                            object.tiles[j] = $types[2].toObject(message.tiles[j], options);
                    }
                    return object;
                };

                /**
                 * Creates a plain object from this GetChunkResponse message. Also converts values to other types if specified.
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GetChunkResponse.prototype.toObject = function toObject(options) {
                    return this.constructor.toObject(this, options);
                };

                /**
                 * Converts this GetChunkResponse to JSON.
                 * @returns {Object.<string,*>} JSON object
                 */
                GetChunkResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Result enum.
                 * @name Result
                 * @memberof UnProtos.Messaging.Responses.GetChunkResponse
                 * @enum {number}
                 * @property {number} UNSET=0 UNSET value
                 * @property {number} SUCCESS=1 SUCCESS value
                 */
                GetChunkResponse.Result = (function() {
                    const valuesById = {}, values = Object.create(valuesById);
                    values["UNSET"] = 0;
                    values["SUCCESS"] = 1;
                    return values;
                })();

                GetChunkResponse.Tile = (function() {

                    /**
                     * Constructs a new Tile.
                     * @exports UnProtos.Messaging.Responses.GetChunkResponse.Tile
                     * @constructor
                     * @param {Object} [properties] Properties to set
                     */
                    function Tile(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Tile ground.
                     * @type {number|undefined}
                     */
                    Tile.prototype.ground = 0;

                    /**
                     * Tile block.
                     * @type {number|undefined}
                     */
                    Tile.prototype.block = 0;

                    /**
                     * Tile detail.
                     * @type {number|undefined}
                     */
                    Tile.prototype.detail = 0;

                    /**
                     * Creates a new Tile instance using the specified properties.
                     * @param {Object} [properties] Properties to set
                     * @returns {UnProtos.Messaging.Responses.GetChunkResponse.Tile} Tile instance
                     */
                    Tile.create = function create(properties) {
                        return new Tile(properties);
                    };

                    /**
                     * Encodes the specified Tile message.
                     * @param {UnProtos.Messaging.Responses.GetChunkResponse.Tile|Object} message Tile message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Tile.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.ground !== undefined && message.hasOwnProperty("ground"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.ground);
                        if (message.block !== undefined && message.hasOwnProperty("block"))
                            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.block);
                        if (message.detail !== undefined && message.hasOwnProperty("detail"))
                            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.detail);
                        return writer;
                    };

                    /**
                     * Encodes the specified Tile message, length delimited.
                     * @param {UnProtos.Messaging.Responses.GetChunkResponse.Tile|Object} message Tile message or plain object to encode
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
                     * @returns {UnProtos.Messaging.Responses.GetChunkResponse.Tile} Tile
                     */
                    Tile.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.UnProtos.Messaging.Responses.GetChunkResponse.Tile();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1:
                                message.ground = reader.int32();
                                break;
                            case 2:
                                message.block = reader.int32();
                                break;
                            case 3:
                                message.detail = reader.int32();
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
                     * @returns {UnProtos.Messaging.Responses.GetChunkResponse.Tile} Tile
                     */
                    Tile.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Tile message.
                     * @param {UnProtos.Messaging.Responses.GetChunkResponse.Tile|Object} message Tile message or plain object to verify
                     * @returns {?string} `null` if valid, otherwise the reason why it is not
                     */
                    Tile.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.ground !== undefined)
                            if (!$util.isInteger(message.ground))
                                return "ground: integer expected";
                        if (message.block !== undefined)
                            if (!$util.isInteger(message.block))
                                return "block: integer expected";
                        if (message.detail !== undefined)
                            if (!$util.isInteger(message.detail))
                                return "detail: integer expected";
                        return null;
                    };

                    /**
                     * Creates a Tile message from a plain object. Also converts values to their respective internal types.
                     * @param {Object.<string,*>} object Plain object
                     * @returns {UnProtos.Messaging.Responses.GetChunkResponse.Tile} Tile
                     */
                    Tile.fromObject = function fromObject(object) {
                        if (object instanceof $root.UnProtos.Messaging.Responses.GetChunkResponse.Tile)
                            return object;
                        let message = new $root.UnProtos.Messaging.Responses.GetChunkResponse.Tile();
                        if (object.ground !== undefined && object.ground !== null)
                            message.ground = object.ground | 0;
                        if (object.block !== undefined && object.block !== null)
                            message.block = object.block | 0;
                        if (object.detail !== undefined && object.detail !== null)
                            message.detail = object.detail | 0;
                        return message;
                    };

                    /**
                     * Creates a Tile message from a plain object. Also converts values to their respective internal types.
                     * This is an alias of {@link UnProtos.Messaging.Responses.GetChunkResponse.Tile.fromObject}.
                     * @function
                     * @param {Object.<string,*>} object Plain object
                     * @returns {UnProtos.Messaging.Responses.GetChunkResponse.Tile} Tile
                     */
                    Tile.from = Tile.fromObject;

                    /**
                     * Creates a plain object from a Tile message. Also converts values to other types if specified.
                     * @param {UnProtos.Messaging.Responses.GetChunkResponse.Tile} message Tile
                     * @param {$protobuf.ConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Tile.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.ground = 0;
                            object.block = 0;
                            object.detail = 0;
                        }
                        if (message.ground !== undefined && message.ground !== null && message.hasOwnProperty("ground"))
                            object.ground = message.ground;
                        if (message.block !== undefined && message.block !== null && message.hasOwnProperty("block"))
                            object.block = message.block;
                        if (message.detail !== undefined && message.detail !== null && message.hasOwnProperty("detail"))
                            object.detail = message.detail;
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

                return GetChunkResponse;
            })();

            Responses.GetTerrainResponse = (function() {

                /**
                 * Constructs a new GetTerrainResponse.
                 * @exports UnProtos.Messaging.Responses.GetTerrainResponse
                 * @constructor
                 * @param {Object} [properties] Properties to set
                 */
                function GetTerrainResponse(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            this[keys[i]] = properties[keys[i]];
                }

                /**
                 * GetTerrainResponse result.
                 * @type {number|undefined}
                 */
                GetTerrainResponse.prototype.result = 0;

                /**
                 * GetTerrainResponse width.
                 * @type {number|undefined}
                 */
                GetTerrainResponse.prototype.width = 0;

                /**
                 * GetTerrainResponse height.
                 * @type {number|undefined}
                 */
                GetTerrainResponse.prototype.height = 0;

                /**
                 * GetTerrainResponse seed.
                 * @type {number|$protobuf.Long|undefined}
                 */
                GetTerrainResponse.prototype.seed = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * GetTerrainResponse chunkSize.
                 * @type {number|undefined}
                 */
                GetTerrainResponse.prototype.chunkSize = 0;

                // Lazily resolved type references
                const $types = {
                    0: "UnProtos.Messaging.Responses.GetTerrainResponse.Result"
                }; $lazyTypes.push($types);

                /**
                 * Creates a new GetTerrainResponse instance using the specified properties.
                 * @param {Object} [properties] Properties to set
                 * @returns {UnProtos.Messaging.Responses.GetTerrainResponse} GetTerrainResponse instance
                 */
                GetTerrainResponse.create = function create(properties) {
                    return new GetTerrainResponse(properties);
                };

                /**
                 * Encodes the specified GetTerrainResponse message.
                 * @param {UnProtos.Messaging.Responses.GetTerrainResponse|Object} message GetTerrainResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GetTerrainResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.result !== undefined && message.hasOwnProperty("result"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.result);
                    if (message.width !== undefined && message.hasOwnProperty("width"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int32(message.width);
                    if (message.height !== undefined && message.hasOwnProperty("height"))
                        writer.uint32(/* id 3, wireType 0 =*/24).int32(message.height);
                    if (message.seed !== undefined && message.seed !== null && message.hasOwnProperty("seed"))
                        writer.uint32(/* id 4, wireType 0 =*/32).int64(message.seed);
                    if (message.chunkSize !== undefined && message.hasOwnProperty("chunkSize"))
                        writer.uint32(/* id 5, wireType 0 =*/40).int32(message.chunkSize);
                    return writer;
                };

                /**
                 * Encodes the specified GetTerrainResponse message, length delimited.
                 * @param {UnProtos.Messaging.Responses.GetTerrainResponse|Object} message GetTerrainResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GetTerrainResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a GetTerrainResponse message from the specified reader or buffer.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {UnProtos.Messaging.Responses.GetTerrainResponse} GetTerrainResponse
                 */
                GetTerrainResponse.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.UnProtos.Messaging.Responses.GetTerrainResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.result = reader.uint32();
                            break;
                        case 2:
                            message.width = reader.int32();
                            break;
                        case 3:
                            message.height = reader.int32();
                            break;
                        case 4:
                            message.seed = reader.int64();
                            break;
                        case 5:
                            message.chunkSize = reader.int32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a GetTerrainResponse message from the specified reader or buffer, length delimited.
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {UnProtos.Messaging.Responses.GetTerrainResponse} GetTerrainResponse
                 */
                GetTerrainResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a GetTerrainResponse message.
                 * @param {UnProtos.Messaging.Responses.GetTerrainResponse|Object} message GetTerrainResponse message or plain object to verify
                 * @returns {?string} `null` if valid, otherwise the reason why it is not
                 */
                GetTerrainResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.result !== undefined)
                        switch (message.result) {
                        default:
                            return "result: enum value expected";
                        case 0:
                        case 1:
                            break;
                        }
                    if (message.width !== undefined)
                        if (!$util.isInteger(message.width))
                            return "width: integer expected";
                    if (message.height !== undefined)
                        if (!$util.isInteger(message.height))
                            return "height: integer expected";
                    if (message.seed !== undefined)
                        if (!$util.isInteger(message.seed) && !(message.seed && $util.isInteger(message.seed.low) && $util.isInteger(message.seed.high)))
                            return "seed: integer|Long expected";
                    if (message.chunkSize !== undefined)
                        if (!$util.isInteger(message.chunkSize))
                            return "chunkSize: integer expected";
                    return null;
                };

                /**
                 * Creates a GetTerrainResponse message from a plain object. Also converts values to their respective internal types.
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Responses.GetTerrainResponse} GetTerrainResponse
                 */
                GetTerrainResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.UnProtos.Messaging.Responses.GetTerrainResponse)
                        return object;
                    let message = new $root.UnProtos.Messaging.Responses.GetTerrainResponse();
                    switch (object.result) {
                    case "UNSET":
                    case 0:
                        message.result = 0;
                        break;
                    case "SUCCESS":
                    case 1:
                        message.result = 1;
                        break;
                    }
                    if (object.width !== undefined && object.width !== null)
                        message.width = object.width | 0;
                    if (object.height !== undefined && object.height !== null)
                        message.height = object.height | 0;
                    if (object.seed !== undefined && object.seed !== null)
                        if ($util.Long)
                            (message.seed = $util.Long.fromValue(object.seed)).unsigned = false;
                        else if (typeof object.seed === "string")
                            message.seed = parseInt(object.seed, 10);
                        else if (typeof object.seed === "number")
                            message.seed = object.seed;
                        else if (typeof object.seed === "object")
                            message.seed = new $util.LongBits(object.seed.low >>> 0, object.seed.high >>> 0).toNumber();
                    if (object.chunkSize !== undefined && object.chunkSize !== null)
                        message.chunkSize = object.chunkSize | 0;
                    return message;
                };

                /**
                 * Creates a GetTerrainResponse message from a plain object. Also converts values to their respective internal types.
                 * This is an alias of {@link UnProtos.Messaging.Responses.GetTerrainResponse.fromObject}.
                 * @function
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UnProtos.Messaging.Responses.GetTerrainResponse} GetTerrainResponse
                 */
                GetTerrainResponse.from = GetTerrainResponse.fromObject;

                /**
                 * Creates a plain object from a GetTerrainResponse message. Also converts values to other types if specified.
                 * @param {UnProtos.Messaging.Responses.GetTerrainResponse} message GetTerrainResponse
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GetTerrainResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.result = options.enums === String ? "UNSET" : 0;
                        object.width = 0;
                        object.height = 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.seed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.seed = options.longs === String ? "0" : 0;
                        object.chunkSize = 0;
                    }
                    if (message.result !== undefined && message.result !== null && message.hasOwnProperty("result"))
                        object.result = options.enums === String ? $types[0][message.result] : message.result;
                    if (message.width !== undefined && message.width !== null && message.hasOwnProperty("width"))
                        object.width = message.width;
                    if (message.height !== undefined && message.height !== null && message.hasOwnProperty("height"))
                        object.height = message.height;
                    if (message.seed !== undefined && message.seed !== null && message.hasOwnProperty("seed"))
                        if (typeof message.seed === "number")
                            object.seed = options.longs === String ? String(message.seed) : message.seed;
                        else
                            object.seed = options.longs === String ? $util.Long.prototype.toString.call(message.seed) : options.longs === Number ? new $util.LongBits(message.seed.low >>> 0, message.seed.high >>> 0).toNumber() : message.seed;
                    if (message.chunkSize !== undefined && message.chunkSize !== null && message.hasOwnProperty("chunkSize"))
                        object.chunkSize = message.chunkSize;
                    return object;
                };

                /**
                 * Creates a plain object from this GetTerrainResponse message. Also converts values to other types if specified.
                 * @param {$protobuf.ConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GetTerrainResponse.prototype.toObject = function toObject(options) {
                    return this.constructor.toObject(this, options);
                };

                /**
                 * Converts this GetTerrainResponse to JSON.
                 * @returns {Object.<string,*>} JSON object
                 */
                GetTerrainResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Result enum.
                 * @name Result
                 * @memberof UnProtos.Messaging.Responses.GetTerrainResponse
                 * @enum {number}
                 * @property {number} UNSET=0 UNSET value
                 * @property {number} SUCCESS=1 SUCCESS value
                 */
                GetTerrainResponse.Result = (function() {
                    const valuesById = {}, values = Object.create(valuesById);
                    values["UNSET"] = 0;
                    values["SUCCESS"] = 1;
                    return values;
                })();

                return GetTerrainResponse;
            })();

            return Responses;
        })();

        return Messaging;
    })();

    return UnProtos;
})();

// Resolve lazy type references to actual types
$util.lazyResolve($root, $lazyTypes);

export { $root as default };
