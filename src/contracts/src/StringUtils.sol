// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

// https://github.com/nalinbhardwaj/ethdosnumber/blob/main/ethdos-contracts/src/HexStrings.sol
library StringUtils {
  bytes16 internal constant ALPHABET = "0123456789abcdef";

  /// @notice Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
  /// @dev Credit to Open Zeppelin under MIT license https://github.com/OpenZeppelin/openzeppelin-contracts/blob/243adff49ce1700e0ecb99fe522fb16cff1d1ddc/contracts/utils/Strings.sol#L55
  function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
    bytes memory buffer = new bytes(2 * length + 2);
    buffer[0] = "0";
    buffer[1] = "x";
    for (uint256 i = 2 * length + 1; i > 1; --i) {
      buffer[i] = ALPHABET[value & 0xf];
      value >>= 4;
    }
    require(value == 0, "Strings: hex length insufficient");
    return string(buffer);
  }

  function toHexStringNoPrefix(uint256 value, uint256 length) internal pure returns (string memory) {
    bytes memory buffer = new bytes(2 * length);
    for (uint256 i = buffer.length; i > 0; i--) {
      buffer[i - 1] = ALPHABET[value & 0xf];
      value >>= 4;
    }
    return string(buffer);
  }

  function toString(uint256 value) internal pure returns (string memory) {
    return toString(abi.encodePacked(value));
  }

  function toString(bytes32 value) internal pure returns (string memory) {
    return toString(abi.encodePacked(value));
  }

  function toString(address account) internal pure returns (string memory) {
    return toString(abi.encodePacked(account));
  }

  function stringEq(string memory a, string memory b) internal pure returns (bool) {
    return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
  }

  function toString(bytes memory data) internal pure returns (string memory) {
    bytes memory alphabet = "0123456789abcdef";

    bytes memory str = new bytes(2 + data.length * 2);
    str[0] = "0";
    str[1] = "x";
    for (uint256 i = 0; i < data.length; i++) {
      str[2 + i * 2] = alphabet[uint256(uint8(data[i] >> 4))];
      str[3 + i * 2] = alphabet[uint256(uint8(data[i] & 0x0f))];
    }
    return string(str);
  }

  // Unpacks uint256s into bytes and then extracts the non-zero characters
  // Only extracts contiguous non-zero characters and ensures theres only 1 such state
  // Note that unpackedLen may be more than packedBytes.length * 8 since there may be 0s
  // TODO: Remove console.logs and define this as a pure function instead of a view
  function convertPackedBytesToBytes(uint256[] memory packedBytes, uint256 maxBytes, uint256 packSize) internal pure returns (string memory extractedString) {
    uint8 state = 0;
    // bytes: 0 0 0 0 y u s h _ g 0 0 0
    // state: 0 0 0 0 1 1 1 1 1 1 2 2 2
    bytes memory nonzeroBytesArray = new bytes(packedBytes.length * 7);
    uint256 nonzeroBytesArrayIndex = 0;
    for (uint16 i = 0; i < packedBytes.length; i++) {
      uint256 packedByte = packedBytes[i];
      uint8[] memory unpackedBytes = new uint8[](packSize);
      for (uint256 j = 0; j < packSize; j++) {
        unpackedBytes[j] = uint8(packedByte >> (j * 8));
      }
      for (uint256 j = 0; j < packSize; j++) {
        uint256 unpackedByte = unpackedBytes[j]; //unpackedBytes[j];
        // console.log(i, j, state, unpackedByte);
        if (unpackedByte != 0) {
          nonzeroBytesArray[nonzeroBytesArrayIndex] = bytes1(uint8(unpackedByte));
          nonzeroBytesArrayIndex++;
          if (state % 2 == 0) {
            state += 1;
          }
        } else {
          if (state % 2 == 1) {
            state += 1;
          }
        }
        packedByte = packedByte >> 8;
      }
    }
    string memory returnValue = string(nonzeroBytesArray);
    require(state >= 1, "Invalid final state of packed bytes in email");
    // console.log("Characters in username: ", nonzeroBytesArrayIndex);
    require(nonzeroBytesArrayIndex <= maxBytes, "Packed bytes more than allowed max length!");
    return returnValue;
    // Have to end at the end of the email -- state cannot be 1 since there should be an email footer
  }

  function bytes32ToString(bytes32 input) internal pure returns (string memory) {
    uint256 i;
    for (i = 0; i < 32 && input[i] != 0; i++) {}
    bytes memory resultBytes = new bytes(i);
    for (i = 0; i < 32 && input[i] != 0; i++) {
      resultBytes[i] = input[i];
    }
    return string(resultBytes);
  }

  // sliceArray is used to slice an array of uint256s from start-end into a new array of uint256s
  function sliceArray(uint256[] memory input, uint256 start, uint256 end) internal pure returns (uint256[] memory) {
    require(start <= end && end <= input.length, "Invalid slice indices");
    uint256[] memory result = new uint256[](end - start);
    for (uint256 i = start; i < end; i++) {
      result[i - start] = input[i];
    }
    return result;
  }

  // stringToUint is used to convert a string like "45" to a uint256 4
  function stringToUint(string memory s) internal pure returns (uint256) {
    bytes memory b = bytes(s);
    uint256 result = 0;
    for (uint256 i = 0; i < b.length; i++) {
      if (b[i] >= 0x30 && b[i] <= 0x39) {
        result = result * 10 + (uint256(uint8(b[i])) - 48);
      }

      // TODO: Currently truncates decimals
      if (b[i] == 0x2E) {
        return result;
      }
    }
    return result;
  }

  // getDomainFromEmail is used to extract the domain from an email i.e. the part after the @
  function getDomainFromEmail(string memory fromEmail) internal pure returns (string memory) {
    bytes memory emailBytes = bytes(fromEmail);
    uint256 atIndex;
    for (uint256 i = 0; i < emailBytes.length; i++) {
      if (emailBytes[i] == "@") {
        atIndex = i;
        break;
      }
    }

    bytes memory domainBytes = new bytes(emailBytes.length - atIndex - 1);
    for (uint256 j = 0; j < domainBytes.length; j++) {
      domainBytes[j] = emailBytes[atIndex + 1 + j];
    }
    return bytes32ToString(bytes32(bytes(domainBytes)));
  }
}
