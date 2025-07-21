const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

const SIGNATURE_PARAM_NAME = 'signature';
const SECRET_PREFIX = 'secret_';
const PUBLICKEY_PREFIX = 'public_';

const PEM_HEADER = "-----BEGIN PUBLIC KEY-----";
const PEM_FOOTER = "-----END PUBLIC KEY-----";

class Scratch3UrlParams {
    constructor(runtime) {
        this.runtime = runtime;
        this.publicKey = null; // Stores the imported public key
        this.lastError = null;
    }

    // Standard Scratch extension info block
    getInfo() {
        return {
            id: 'urlparams',
            name: 'URL Params',
            color1: '#4C97FF',
            blocks: [
                {
                    opcode: 'setPublicKey',
                    blockType: BlockType.COMMAND,
                    text: 'set public key [KEY_STRING]',
                    arguments: {
                        KEY_STRING: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Your PEM public key'
                        }
                    }
                },
                {
                    opcode: 'hasSignature',
                    blockType: BlockType.BOOLEAN,
                    text: 'URL has signature?',
                },
                {
                    opcode: 'isSignatureValid',
                    blockType: BlockType.BOOLEAN,
                    text: 'is signature valid?',
                },
                {
                    opcode: 'getQueryParamValue',
                    blockType: BlockType.REPORTER,
                    text: 'value of query param [PARAM_NAME]',
                    arguments: {
                        PARAM_NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name'
                        }
                    }
                },
                {
                    opcode: 'getLastError',
                    blockType: BlockType.REPORTER,
                    text: 'last extension error',
                    disableMonitor: false // Allow it to be monitored
                }
            ]
        };
    }

    _clearLastError() {
        this.lastError = null;
    }

    // --- Block Implementations ---

    getLastError() {
        return this.lastError;
    }

    async setPublicKey(args) {
        this._clearLastError();
        const keyString = args.KEY_STRING;
        try {
            let pem = keyString;
            if (!pem.startsWith(pemHeader)) {
                // Assume it's just the base64 string and add headers/footers
                pem = `${PEM_HEADER}\n${keyString.replace(/(\r\n|\n|\r)/gm, '').match(/.{1,64}/g).join('\n')}\n${PEM_FOOTER}`;
            }

            const binaryDer = this._pemToArrayBuffer(pem);
            this.publicKey = await crypto.subtle.importKey(
                "spki", // SubjectPublicKeyInfo for PEM
                binaryDer,
                { name: "Ed25519" },
                false,
                ["verify"]
            );
        } catch (e) {
            console.error("Failed to import public key:", e);
            this.lastError = `Failed to import public key: ${e.message}`;
            this.publicKey = null;
        }
    }

    _pemToArrayBuffer(pem) {
        let pemContents = pem.substring(PEM_HEADER.length, pem.length - PEM_FOOTER.length)
            .replace(/\s/g, ''); // Remove all whitespace

        if (pemContents && pemContents.startsWith(SECRET_PREFIX)) {
            throw new Error('The value is a secret not a public key. Please use the public key.');
        }

        if (pemContents && pemContents.startsWith(PUBLICKEY_PREFIX)) {
            pemContents = pemContents.substring(PUBLICKEY_PREFIX.length);
        }

        const binaryDerString = atob(pemContents);
        const binaryDer = new Uint8Array(binaryDerString.length);
        for (let i = 0; i < binaryDerString.length; i++) {
            binaryDer[i] = binaryDerString.charCodeAt(i);
        }
        return binaryDer.buffer;
    }

    _base64UrlToArrayBuffer(base64Url) {
        // Convert from Base64 URL safe to regular Base64, then decode
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    async isSignatureValid() {
        this._clearLastError();
        const queryParams = this._getQueryParams();

        if (!queryParams.has(SIGNATURE_PARAM_NAME)) {
            this.lastError = "Public key not set. Please call 'set public key' block first.";
            return false;
        }

        const signature = queryParams.get('signature');

        const paramsToSign = new URLSearchParams();
        const sortedKeys = Array.from(queryParams.keys()).filter(k => k !== SIGNATURE_PARAM_NAME).sort();

        for (const key of sortedKeys) {
            const value = queryParams.get(key);
            paramsToSign.append(key, value);
        }

        const dataToVerify = new TextEncoder().encode(paramsToSign.toString());
        const signatureBuffer = this._base64UrlToArrayBuffer(signature);

        try {
            const signatureValid = await crypto.subtle.verify(
                { name: "Ed25519" },
                this.publicKey,
                signatureBuffer,
                dataToVerify
            );

            if (signatureValid) {
                return true;
            }
        } catch (e) {
            console.error("Error during signature verification:", e);
            this.lastError = 'Error during signature verification: ' + e.message;
        }

        return false;
    }

    hasSignature() {
        this._clearLastError();
        const queryParams = this._getQueryParams();
        return queryParams.has(SIGNATURE_PARAM_NAME);
    }

    getQueryParamValue(args) {
        this._clearLastError();
        const paramName = args.PARAM_NAME;
        const queryParams = this._getQueryParams();
        queryParams.delete(SIGNATURE_PARAM_NAME);

        return queryParams.get(paramName) || '';
    }

    _getQueryParams() {
        const url = window.location.href;
        const urlObj = new URL(url);
        return urlObj.searchParams;
    }
}
module.exports = Scratch3UrlParams;