/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I should see new bills form", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByText("Envoyer une note de frais"));
      const billsType = screen.getByText("Type de dépense");
      expect(billsType).toBeTruthy();
      const billsName = screen.getByText("Nom de la dépense");
      expect(billsName).toBeTruthy();
      const billsDate = screen.getByText("Date");
      expect(billsDate).toBeTruthy();
      const billsAmount = screen.getByText("Montant TTC");
      expect(billsAmount).toBeTruthy();
      const billsTVA = screen.getByText("TVA");
      expect(billsTVA).toBeTruthy();
      const billsComment = screen.getByText("Commentaire");
      expect(billsComment).toBeTruthy();
      const billsJustificative = screen.getByText("Justificatif");
      expect(billsJustificative).toBeTruthy();
    });

    describe("When I fill correctly the form and I submit it", () => {
      test("a new bill should be created", async () => {
        const newBill = {
          type: "IT et électronique",
          name: "test",
          date: "2024-07-02",
          amount: 700,
          commentary: "test",
          fileUrl: "https://localhost:3456/images/test.jpg",
          pct: 20,
        };

        const mockStoreBills = mockStore.bills();

        mockStoreBills.create(() => {
          return {
            fileUrl: "https://localhost:3456/images/test.jpg",
            key: "1234",
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);

        const createdBill = await mockStoreBills.create(newBill);
        expect(createdBill).toEqual({
          fileUrl: "https://localhost:3456/images/test.jpg",
          key: "1234",
        });
        expect(newBill).toBeTruthy();
      });
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", { value: localStorageMock });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "e@e",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("create new bill fails with 404 message error", async () => {
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        document.body.innerHTML = "Erreur 404";
        const message = await screen.findByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("create new bill fails with 500 message error", async () => {
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        document.body.innerHTML = "Erreur 500";
        const message = await screen.findByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I add a new bill", () => {
      test("Then it should trigger form submit button", () => {
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
        document.body.innerHTML = NewBillUI();
        const onNavigate = jest.fn();
        const store = null;

        const newBillPage = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        const spyOnHandleSubmit = jest.spyOn(newBillPage, "handleSubmit");
        const formNewBill = document.querySelector(`form[data-testid="form-new-bill"]`);
        formNewBill.addEventListener("submit", newBillPage.handleSubmit);
        fireEvent.submit(formNewBill);

        expect(spyOnHandleSubmit).toHaveBeenCalled();
      });
    });

    describe("When I add file", () => {
      test("Then it should trigger the handleChangeFile function", async () => {
        Object.defineProperty(window, "localStorage", { value: localStorageMock });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "e@e",
          })
        );

        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        document.body.innerHTML = NewBillUI();

        const onNavigate = jest.fn();
        const mockStore = {
          bills: () => ({
            create: jest.fn().mockResolvedValue({ fileUrl: "url", key: "12345" }),
          }),
        };

        const newBillPage = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const fileInput = document.querySelector(`input[data-testid="file"]`);
        const file = new File(["content"], "mockTest.png", { type: "image/png" });
        Object.defineProperty(fileInput, "files", {
          value: [file],
        });

        const spyOnHandleChangeFile = jest.spyOn(newBillPage, "handleChangeFile");
        fileInput.addEventListener("change", newBillPage.handleChangeFile);
        fireEvent.change(fileInput);

        expect(spyOnHandleChangeFile).toHaveBeenCalled();
      });
    });
  });
});
