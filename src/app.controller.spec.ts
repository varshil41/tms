import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("Root", () => {
    it("should return server is working fine", async () => {
      const result = await appController.helthcheck();
      expect(result).toEqual({ message: "🚀 Server is working fine 🛡️." });
    });
  });
});
