/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When ulpoading an image at good format", () => {
      test("Should save the user's email", () => {
        // Mocking function and data
        const mockGetElementById = jest.fn().mockReturnValue({});
        const createMock = jest
          .fn()
          .mockResolvedValue({ fileUrl: "fileURL", key: "key" });
        const goodFormatImage = new File(["img"], "image.png", {
          type: "image/png",
        });

        const documentMock = {
          querySelector: (selector) => {
            if (selector === 'input[data-testid="file"]') {
              return {
                files: [goodFormatImage],
                addEventListener: jest.fn(),
              };
            } else {
              return { addEventListener: jest.fn() };
            }
          },
          getElementById: mockGetElementById,
        };

        // Set up localStorage
        localStorage.setItem("user", '{"email" : "user@email.com"}');

        //Setting up test instance
        const storeMock = {
          bills: () => ({
            create: createMock,
          }),
        };
        const objectInstance = new NewBill({
          document: documentMock,
          onNavigate: {},
          store: storeMock,
          localStorage: {},
        });

        // Triggering file upload
        objectInstance.handleChangeFile({
          preventDefault: jest.fn(),
          target: { value: "image.png" },
        });

        // Expectations
        const expectedEmail = "user@email.com";
        const formData = createMock.mock.calls[0][0].data;
        console.log("formData", formData);

        expect(formData.get("email")).toEqual(expectedEmail);
      });
    });

    describe("When submitting a new bill", () => {
      test("Should call the update methode on the store", () => {
        const mockGetElementById = jest.fn().mockReturnValue({});
        const createMock = jest.fn();
        const goodFormatImage = new File(["img"], "image.png", {
          type: "image/png",
        });
        const mockUpdate = jest.fn().mockResolvedValue({});

        const documentMock = {
          querySelector: (selector) => {
            if (selector === "input[data-testid='file']") {
              return {
                files: [goodFormatImage],
                addEventListener: jest.fn(),
              };
            } else {
              return { addEventListener: jest.fn() };
            }
          },
          getElementById: mockGetElementById,
        };

        const storeMock = {
          bills: () => ({
            update: mockUpdate,
          }),
        };

        // Setting up test instance
        const objectInstance = new NewBill({
          document: documentMock,
          onNavigate: jest.fn(),
          store: storeMock,
          localStorage: {},
        });

        // Triggering form submission
        objectInstance.handleSubmit({
          preventDefault: jest.fn(),
          target: {
            querySelector: (selector) => {
              switch (selector) {
                case 'select[data-testid="expense-type"]':
                  return { value: "type" };
                case 'input[data-testid="expense-name"]':
                  return { value: "name" };
                case 'input[data-testid="amount"]':
                  return { value: "3000" };
                case 'input[data-testid="datepicker"]':
                  return { value: "date" };
                case 'input[data-testid="vat"]':
                  return { value: "vat" };
                case 'input[data-testid="pct"]':
                  return { value: "25" };
                case 'textarea[data-testid="commentary"]':
                  return { value: "commentary" };

                default:
                  break;
              }
            },
          },
        });

        // Expectation
        const dataToCheck = {
          email: "user@email.com",
          type: "type",
          name: "name",
          amount: 3000,
          date: "date",
          vat: "vat",
          pct: 25,
          commentary: "commentary",
          fileUrl: null,
          fileName: null,
          status: "pending",
        };

        // Analyzing the data passed to the function
        const data = JSON.parse(mockUpdate.mock.calls[0][0].data);
        console.log("data", data);

        expect(data).toMatchObject(dataToCheck);
      });
    });
  });
});
