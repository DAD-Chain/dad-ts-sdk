
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

import { Address } from '../../crypto';
import { makeNativeContractTx } from '../../transaction/transactionUtils';
import { hex2VarBytes, str2hexstr, varifyPositiveInt } from '../../utils';
import { buildNativeCodeScript } from '../abi/nativeVmParamsBuilder';
import Struct from '../abi/struct';
import { Transaction } from './../../transaction/transaction';

/**
 * Address of auth contract.
 */
export const AUTH_CONTRACT = '0000000000000000000000000000000000000006';
const contractAddress = new Address(AUTH_CONTRACT);

/**
 * Creates transaction that initialize the admin of some contract.
 * @param adminoldId Admin's ONT ID
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeInitContractAdminTx(
    adminoldId: string,
    payer: Address,
    gasPrice: string,
    gasLimit: string): Transaction {
    if (adminoldId.substr(0, 3) === 'did') {
        adminoldId = str2hexstr(adminoldId);
    }
    const params = hex2VarBytes(adminoldId);
    const tx = makeNativeContractTx('initContractAdmin', params, contractAddress,
                                     gasPrice, gasLimit, payer);
    return tx;
}

/**
 * Transfer the authority to new admin
 * @param contractAddr Uer's contract address
 * @param newAdminoldId New admin's OLD ID. This id must be registered.
 * @param keyNo Original admin's public key id. Use this pk to varify tx.
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeTransferAuthTx(
    contractAddr: Address,
    newAdminoldId: string,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (newAdminoldId.substr(0, 3) === 'did') {
        newAdminoldId = str2hexstr(newAdminoldId);
    }
    const struct = new Struct();
    struct.add(contractAddress.serialize(), newAdminoldId, keyNo);
    const list = [struct];
    const params = buildNativeCodeScript(list);

    const tx = makeNativeContractTx('transfer', params, contractAddress, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * verify the user's token of target contract
 * @param contractAddr user's target contract address
 * @param calleroldId caller's DAD ID.This id must be registered.
 * @param funcName the function to call
 * @param keyNo publicKey's id, use this pk to varify tx
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeVerifyTokenTx(
    contractAddr: Address,
    calleroldId: string,
    funcName: string,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (calleroldId.substr(0, 3) === 'did') {
        calleroldId = str2hexstr(calleroldId);
    }
    const struct = new Struct();
    struct.add(contractAddr.serialize(), calleroldId, str2hexstr(funcName), keyNo);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx('verifyToken', params, contractAddress, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * assign functions to role. must be called by contract's admin
 * @param contractAddr target contract's address
 * @param adminoldId admin's OLD ID.This id must be registered.
 * @param role role name
 * @param funcNames array of function name
 * @param keyNo publicKey's id, use the pk to varify tx
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeAssignFuncsToRoleTx(
    contractAddr: Address,
    adminoldId: string,
    role: string,
    funcNames: string[],
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (adminoldId.substr(0, 3) === 'did') {
        adminoldId = str2hexstr(adminoldId);
    }
    const struct = new Struct();
    struct.add(contractAddr.serialize(), adminoldId, str2hexstr(role), funcNames.length);
    for (const f of funcNames) {
        struct.add(str2hexstr(f));
    }
    struct.add(keyNo);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx('assignFuncsToRole', params,
                                    contractAddress, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * assign role to OLD IDs. must be called by contract's admin
 * @param contractAddr target contract's address
 * @param adminoldId admin's OLD ID.This id must be registered.
 * @param role role's name
 * @param oldIds array of OLD ID
 * @param keyNo admin's pk id.use to varify tx.
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeAssignoldIdsToRoleTx(
    contractAddr: Address,
    adminoldId: string,
    role: string,
    oldIds: string[],
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (adminoldId.substr(0, 3) === 'did') {
        adminoldId = str2hexstr(adminoldId);
    }
    const struct = new Struct();
    struct.add(contractAddr.serialize(), adminoldId, str2hexstr(role), oldIds.length);
    for (const i of oldIds) {
        if (i.substr(0, 3) === 'did') {
            struct.add(str2hexstr(i));
        } else {
            struct.add(i);
        }
    }
    struct.add(keyNo);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx('assignoldIdsToRole', params,
        contractAddress, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * delegate role to others. Can't delegate repeatedly。
 * @param contractAddr target contract's address
 * @param from OLD ID of user that wants to delegate role.This id must be registered.
 * @param to OLD ID of user that will receive role.This id must be registered.
 * @param role role name
 * @param period time of delegate period in second
 * @param level = 1 for now.
 * @param keyNo The number of user's publick in the DDO.
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeDelegateRoleTx(
    contractAddr: Address,
    from: string,
    to: string,
    role: string,
    period: number,
    level: number = 1,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    varifyPositiveInt(period);
    if (from.substr(0, 3) === 'did') {
        from = str2hexstr(from);
    }
    if (to.substr(0, 3) === 'did') {
        to = str2hexstr(to);
    }
    const struct = new Struct();
    struct.add(contractAddr.serialize(), from, to, str2hexstr(role), period, level, keyNo);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx('delegate', params,
        contractAddress, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * role's owner can withdraw the delegate in advance
 * @param contractAddr target contract's address
 * @param initiator OLD ID of role's owner.This id must be registered.
 * @param delegate OLD ID of role's agent.This id must be registered.
 * @param role role's name
 * @param keyNo The number of user's public key in the DDO
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeWithdrawRoleTx(
    contractAddr: Address,
    initiator: string,
    delegate: string,
    role: string,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (initiator.substr(0, 3) === 'did') {
        initiator = str2hexstr(initiator);
    }
    if (delegate.substr(0, 3) === 'did') {
        delegate = str2hexstr(delegate);
    }
    const struct = new Struct();
    struct.add(contractAddr.serialize(), initiator, delegate, str2hexstr(role), keyNo);
    const params = buildNativeCodeScript([struct]) ;

    const tx = makeNativeContractTx('withdraw', params,
        contractAddress, gasPrice, gasLimit, payer);
    return tx;
}
