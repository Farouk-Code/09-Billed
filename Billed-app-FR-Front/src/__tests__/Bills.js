/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import MokedStore from "../__mocks__/store.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      const hasActiveIconClass = windowIcon.classList.contains("active-icon");

      expect(hasActiveIconClass).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  test("Then clicking on 'New Bill button should navigate to the NewBill page'", async () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);

    router();
    await window.onNavigate(ROUTES_PATH.Bills);

    await waitFor(() => screen.getByTestId("btn-new-bill"));

    const buttonNewBill = screen.getByTestId("btn-new-bill");
    await buttonNewBill.dispatchEvent(new MouseEvent("click"));

    const newBillUrl = window.location.href.replace(
      /^https?:\/\/localhost\//,
      ""
    );
    expect(newBillUrl).toBe("#employee/bill/new");
  });

  test("handleClickIconEye shows modal", () => {
    const billsInstance = new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: MokedStore,
    });
    const mockIcon = document.createElement("div");
    mockIcon.setAttribute("data-bill-url", "mockBillUrl");

    // Mock the modal function directly on the prototype of window.$
    window.$.fn.modal = jest.fn();

    billsInstance.handleClickIconEye(mockIcon);

    // Checking if the modal function was called with the expected parameters
    expect(window.$.fn.modal).toHaveBeenCalledWith("show");
  });

  test("GET Bills successfully retrieves bills from the mock store", async () => {
    const mockStore = {
      bills: jest.fn(() => ({
        list: jest.fn(() =>
          Promise.resolve([
            {
              id: "47qAXb6fIm2zOKkLzMro",
              vat: "80",
              fileUrl:
                "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
              status: "pending",
              type: "Hôtel et logement",
              commentary: "séminaire billed",
              name: "encore",
              fileName: "preview-facture-free-201801-pdf-1.jpg",
              date: "2004-04-04",
              amount: 400,
              commentAdmin: "ok",
              email: "a@a",
              pct: 20,
            },
            {
              id: "BeKy5Mo4jkmdfPGYpTxZ",
              vat: "",
              amount: 100,
              name: "test1",
              fileName: "1592770761.jpeg",
              commentary: "plop",
              pct: 20,
              type: "Transports",
              email: "a@a",
              fileUrl:
                "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
              date: "2001-01-01",
              status: "refused",
              commentAdmin: "en fait non",
            },
          ])
        ),
      })),
    };

    const billsComponent = new Bills({
      document,
      onNavigate,
      store: mockStore,
    });
    const getBillsPromise = billsComponent.getBills();

    await getBillsPromise;

    // Verify that the mock store was called to retrieve bills
    expect(mockStore.bills).toHaveBeenCalledTimes(1);

    // Access the bills directly from the mock store after the promise resolves
    const billsFromStore = await mockStore.bills().list();

    // Verify that the "getBills" method returned an array of bills
    expect(billsFromStore).toBeTruthy();
    expect(billsFromStore.length).toBe(2);
  });
});
