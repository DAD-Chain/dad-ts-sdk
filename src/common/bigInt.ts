/*
* Copyright (C) 2018 The DAD Authors
* This file is part of The DAD library.
*
* The DAD is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* The DAD is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with The DAD.  If not, see <http://www.gnu.org/licenses/>.
*/

import { BigNumber } from 'bignumber.js';
import * as Long from 'long';
import { ERROR_CODE } from './../error';
import { bigIntToBytes, reverseHex } from './../utils';

const SIZE = 8;
/**
 * Big positive integer base on BigNumber
 */
export default class BigInt {
    /**
     * Create BigInt from string
     * @param hex Byte string value
     */
    static fromHexstr(hex: string): BigInt {
        hex = reverseHex(hex);
        const bi = new BigNumber(hex, 16).toString();
        return new BigInt(bi);
    }

    value: string | number;
    ledgerCompatible: boolean;

    constructor(value: string | number, ledgerCompatible: boolean = true) {
        const bi = new BigNumber(value);
        if (!bi.isInteger() || bi.isNegative()) {
            throw ERROR_CODE.INVALID_PARAMS;
        }
        this.value = value;
        this.ledgerCompatible = ledgerCompatible;
    }

    /**
     * Create hex string from BigInt
     */
    toHexstr(): string {
        const bi = Long.fromValue(this.value);
        let hex = bigIntToBytes(bi);
        if (this.ledgerCompatible && (hex.length % 2 !== 0 || hex.length < 16)) {
            hex = hex + '0'.repeat(SIZE * 2 - hex.length);
        }
        return hex;
    }
}
