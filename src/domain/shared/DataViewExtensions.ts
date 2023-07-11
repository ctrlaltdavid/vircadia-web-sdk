//
//  DataViewExtensions.ts
//
//  Created by David Rowe on 16 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  The <code>DataView</code> namespace comprises methods added to the prototype of JavaScript's
 *  {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView|DataView} object, for
 *  handling reading and writing large <code>bigint</code> values. These methods are added only if they aren't already present
 *  in the browser's <code>DataView</code> implementation.
 *  <p>C++: N/A</p>
 *  @namespace DataView
 */

// WEBRTC TODO: May need to implement Uint64 methods for some browsers (e.g., Safari) if Babel doesn't handle this.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView#64-bit_integer_values

/* eslint-disable @typescript-eslint/no-magic-numbers, @typescript-eslint/no-invalid-this  */

const MAX_U128_VALUE = 2n ** 128n - 1n;
const SHIFT_64_BITS = 64n;
const MASK_64_BITS = 0xffffffffffffffffn;

/*@devdoc
 *  Writes an unsigned 128-bit (16-byte) integer value to the DataView.
 *  @function DataView.setBigUint128
 *  @param {number} byteOffset - The offset from the start of the DataView.
 *  @param {bigint} value - The value to write. The maximum value is <code>2n ** 128n - 1n</code>. If larger than this value,
 *      a value of <code>0n</code> is written.
 *  @param {boolean} littleEndian=false - <code>true</code> to write the data in little-endian format, <code>false</codE> to
 *      write in big-endian format.
 */
function setBigUint128(this: DataView, byteOffset: number, value: bigint, littleEndian = false) {
    const sanitizedValue = value > MAX_U128_VALUE ? 0n : value;
    if (littleEndian) {
        this.setBigUint64(byteOffset + 8, sanitizedValue >> SHIFT_64_BITS, littleEndian);
        this.setBigUint64(byteOffset, sanitizedValue & MASK_64_BITS, littleEndian);
    } else {
        this.setBigUint64(byteOffset, sanitizedValue >> SHIFT_64_BITS, littleEndian);
        this.setBigUint64(byteOffset + 8, sanitizedValue & MASK_64_BITS, littleEndian);
    }
}

/*@devdoc
 *  Reads an unsigned 128-bit (16-byte) integer value from the DataView.
 *  @function DataView.getBigUint128
 *  @param {number} byteOffset - The offset from the start of the DataView.
 *  @param {boolean} littleEndian=false - <code>true</code> to read the data in little-endian format, <code>false</codE> to read
 *      read in big-endian format.
 *  @returns {bigint} The value read.
 */
function getBigUint128(this: DataView, byteOffset: number, littleEndian = false): bigint {
    let result = 0n;
    if (littleEndian) {
        result = (this.getBigUint64(byteOffset + 8, littleEndian) << SHIFT_64_BITS)
            + this.getBigUint64(byteOffset, littleEndian);
    } else {
        result = (this.getBigUint64(byteOffset, littleEndian) << SHIFT_64_BITS)
            + this.getBigUint64(byteOffset + 8, littleEndian);
    }
    return result;
}

/* eslint-enable @typescript-eslint/no-magic-numbers, no-invalid-this  */

/* eslint-disable no-extend-native */

export { };  // Provide a module context for the declaration.

declare global {
    interface DataView {
        setBigUint128: (this: DataView, byteOffset: number, value: bigint, littleEndian: boolean) => void;
        getBigUint128: (this: DataView, byteOffset: number, littleEndian: boolean) => bigint;
    }
}

if (!Object.prototype.hasOwnProperty.call(DataView, "setBigUint128")) {
    DataView.prototype.setBigUint128 = setBigUint128;
}
if (!Object.prototype.hasOwnProperty.call(DataView, "getBigUint128")) {
    DataView.prototype.getBigUint128 = getBigUint128;
}

/* eslint-enable no-extend-native */
