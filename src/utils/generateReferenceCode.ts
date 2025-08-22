
export const generateReferenceCode = (): string => {
          let referenceCode = "";
          for (let i = 0; i < 20; i++) {
            referenceCode += Math.floor(Math.random() * 10); // Append a random digit (0-9)
          }
          return referenceCode;
        };