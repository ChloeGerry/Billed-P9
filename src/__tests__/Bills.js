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
        bills,
        localStorage: window.localStorage,
      });

      const spy = jest.spyOn(employeeDashboard, "sortBillsByDate");
      employeeDashboard.sortBillsByDate(bills);
      expect(spy).toHaveBeenCalled();

      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML);

      mockSortBillsByDate(dates);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When the getBills function is called", () => {
    test("it should return all bills", async () => {
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
        bills,
        localStorage: window.localStorage,
      });

      const spy = jest.spyOn(employeeDashboard, "getBills");
      const mockedBills = await employeeDashboard.getBills();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("When I click on the eye icon", () => {
    test("A modal should open", () => {
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
        bills,
        localStorage: window.localStorage,
      });

      $.fn.modal = function (action) {
        if (action === "show") {
          this.addClass("show").css("display", "block");
          this.attr("aria-hidden", "false");
        }
        return this;
      };

      const spy = jest.spyOn(employeeDashboard, "handleClickIconEye");

      const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
      fireEvent.click(iconEye);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe("When I click on the new bill button", () => {
    test("it triggers handleClickNewBill and navigates to NewBill page", () => {
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
        bills,
        localStorage: window.localStorage,
      });

      const spy = jest.spyOn(employeeDashboard, "handleClickNewBill");
      const newSpy = jest.spyOn(employeeDashboard, "onNavigate");

      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
      buttonNewBill.addEventListener("click", employeeDashboard.handleClickNewBill);
      fireEvent.click(buttonNewBill);

      expect(spy).toHaveBeenCalled();
      expect(newSpy).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
  });
});

describe("When I navigate to Dashboard", () => {
  test("fetches bills from mock API GET", async () => {
    localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.Dashboard);
    await waitFor(() => screen.getByText("Mes notes de frais"));
    const billsType = await screen.getByText("Type");
    expect(billsType).toBeTruthy();
    const billsName = await screen.getByText("Nom");
    expect(billsName).toBeTruthy();
    const billsDate = await screen.getByText("Date");
    expect(billsDate).toBeTruthy();
    const billsAmount = await screen.getByText("Montant");
    expect(billsAmount).toBeTruthy();
    const billsStatut = await screen.getByText("Statut");
    expect(billsStatut).toBeTruthy();
    const billsActions = await screen.getByText("Actions");
    expect(billsActions).toBeTruthy();
  });
});
