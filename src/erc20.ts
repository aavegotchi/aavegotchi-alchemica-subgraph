import {
    Transfer as TransferEvent,
} from "@openzeppelin/subgraphs/generated/erc20/IERC20";

import {
    constants,
    decimals,
} from "@amxx/graphprotocol-utils";

import { fetchAccount } from "./fetch/account";

import {
    fetchERC20,
    fetchERC20Balance,
} from "./fetch/erc20";
import { ADDRESS_BURN } from "./constants";

export function handleTransfer(event: TransferEvent): void {
    let contract = fetchERC20(event.address);
    if (event.params.from == constants.ADDRESS_ZERO) {
        let totalSupply = fetchERC20Balance(contract, null);
        totalSupply.valueExact = totalSupply.valueExact.plus(
            event.params.value
        );
        totalSupply.value = decimals.toDecimals(
            totalSupply.valueExact,
            contract.decimals
        );
        totalSupply.save();
    } else {
        let from = fetchAccount(event.params.from);
        let balance = fetchERC20Balance(contract, from);
        balance.valueExact = balance.valueExact.minus(event.params.value);
        balance.value = decimals.toDecimals(
            balance.valueExact,
            contract.decimals
        );
        balance.save();
    }

    if (
        event.params.to == constants.ADDRESS_ZERO ||
        event.params.to == ADDRESS_BURN
    ) {
        let burnAccount = fetchAccount(event.params.to);
        let burnedBalance = fetchERC20Balance(contract, burnAccount);

        burnedBalance.valueExact = burnedBalance.valueExact.plus(
            event.params.value
        );
        burnedBalance.value = decimals.toDecimals(
            burnedBalance.valueExact,
            contract.decimals
        );
        burnedBalance.save();

        // remove from total supply
        let totalSupply = fetchERC20Balance(contract, null);
        totalSupply.valueExact = totalSupply.valueExact.minus(
            event.params.value
        );
        totalSupply.value = decimals.toDecimals(
            totalSupply.valueExact,
            contract.decimals
        );
        totalSupply.save();
    } else {
        let to = fetchAccount(event.params.to);
        let balance = fetchERC20Balance(contract, to);
        balance.valueExact = balance.valueExact.plus(event.params.value);
        balance.value = decimals.toDecimals(
            balance.valueExact,
            contract.decimals
        );
        balance.save();
    }
}
