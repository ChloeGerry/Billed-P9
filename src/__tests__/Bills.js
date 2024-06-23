/**
 * @jest-environment jsdom
 */

import $ from "jquery";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { mockSortBillsByDate } from "../__mocks__/functions.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
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

      expect(windowIcon).toBeTruthy();
    });

    test("Then I shoud see all bills", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = jest.fn();

      const store = {
        bills: jest.fn(() => ({
          list: jest.fn().mockResolvedValue([
            { id: 1, date: "2023-12-17", status: "pending" },
            { id: 2, date: "2023-02-25", status: "accepted" },
          ]),
        })),
      };

      const employeeDashboard = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const spyOnGetBills = jest.spyOn(employeeDashboard, "getBills");
      const mockedBills = await employeeDashboard.getBills();
      expect(spyOnGetBills).toHaveBeenCalled();
    });
  });

  test("Then bills should be ordered from earliest to latest", async () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    document.body.innerHTML = BillsUI({ data: bills });
    const onNavigate = jest.fn();

    const store = null;
    const employeeDashboard = new Bills({
      document,
      onNavigate,
      store,
      localStorage: window.localStorage,
    });

    const spyOnSortBillsByDate = jest.spyOn(employeeDashboard, "sortBillsByDate");
    employeeDashboard.sortBillsByDate(bills);
    expect(spyOnSortBillsByDate).toHaveBeenCalled();

    const dates = screen
      .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
      .map((a) => a.innerHTML);

    mockSortBillsByDate(dates);
    const antiChrono = (a, b) => (a < b ? 1 : -1);
    const datesSorted = [...dates].sort(antiChrono);

    expect(dates).toEqual(datesSorted);
  });

  describe("When I click on the eye icon", () => {
    test("Then the modal showing the bill file should open", () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const employeeDashboard = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      $.fn.modal = function (action) {
        if (action === "show") {
          this.addClass("show").css("display", "block");
          this.attr("aria-hidden", "false");
        }
        return this;
      };

      const spyOnHandleClickIconEye = jest.spyOn(employeeDashboard, "handleClickIconEye");

      const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
      fireEvent.click(iconEye);

      expect(spyOnHandleClickIconEye).toHaveBeenCalled();
    });
  });

  describe("When I click on the new bill button", () => {
    test("Then I should navigates to NewBill page", () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = jest.fn();

      const store = null;
      const employeeDashboard = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const spyOnHandleClickNewBill = jest.spyOn(employeeDashboard, "handleClickNewBill");
      const spyOnNavigate = jest.spyOn(employeeDashboard, "onNavigate");

      const buttonNewBill = document.querySelector('button[data-testid="btn-new-bill"]');
      buttonNewBill.addEventListener("click", employeeDashboard.handleClickNewBill);
      fireEvent.click(buttonNewBill);

      expect(spyOnHandleClickNewBill).toHaveBeenCalled();
      expect(spyOnNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
  });
});

describe("When I navigate to the employee's dashboard", () => {
  test("Then it should fetches bills from mock API GET", async () => {
    localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.Bills);
    await waitFor(() => screen.getByText("Mes notes de frais"));

    const billsType = await screen.findByText("Type");
    expect(billsType).toBeTruthy();
    const billsName = await screen.findByText("Nom");
    expect(billsName).toBeTruthy();
    const billsDate = await screen.findByText("Date");
    expect(billsDate).toBeTruthy();
    const billsAmount = await screen.findByText("Montant");
    expect(billsAmount).toBeTruthy();
    const billsStatut = await screen.findByText("Statut");
    expect(billsStatut).toBeTruthy();
    const billsActions = await screen.findByText("Actions");
    expect(billsActions).toBeTruthy();
  });
});
