// utils/generateReferenceCode.ts
// export const generateReferenceCode = (): string => {
//           const min = 10000000000000000000n; // 20-digit minimum (10^19)
//           const max = 99999999999999999999n; // 20-digit maximum (10^20 - 1)
//           const randomNumber = BigInt(Math.floor(Number(min) + Math.random() * Number(max - min)));
//           return randomNumber.toString();
//         };

export const generateReferenceCode = (): string => {
          let referenceCode = "";
          for (let i = 0; i < 20; i++) {
            referenceCode += Math.floor(Math.random() * 10); // Append a random digit (0-9)
          }
          return referenceCode;
        };