// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract CREATE2Factory {
    event Deployed(address addr, bytes32 salt);

    function deploy(bytes32 salt, bytes memory code) public payable returns (address) {
        address addr;
        assembly {
            addr := create2(callvalue(), add(code, 0x20), mload(code), salt)
            if iszero(extcodesize(addr)) {
                revert(0,0)
            }
        }
        emit Deployed(addr, salt);
        return addr;
    }

    function computeAddress(bytes32 salt, bytes32 initCodeHash)
        public
        view
        returns (address)
    {
        return address(uint160(uint(keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, initCodeHash)
        ))));
    }
}