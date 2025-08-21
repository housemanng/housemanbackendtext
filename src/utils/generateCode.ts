export const generatePropertyCode = (): string => {
          const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          let code = "PROP-";
          for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          return code;
        };