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

/**
 * Interface for other classes to implement, which should be signable.
 */
export interface Signable {
    /**
     * Get the sign content of object
     */
    getSignContent(): string;

    /**
     * Gets the raw serialized content of signable object without hashing
     */
    serializeUnsignedData(): string;
}
