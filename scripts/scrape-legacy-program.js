"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var playwright_core_1 = require("playwright-core");
var fs = require("fs");
var path = require("path");
var EMAIL = 'vladislav.shirobokov@gmail.com';
var PASSWORD = 'vladislav456';
var TARGET_URL = 'https://sales.upgradecrm.ru/dashboard/program/event/16';
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var browser, context, page, inertiaData, __filename, __dirname, dataDir, token, apiHeaders, eventResponse, speakersResponse, output, err_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 Запускаем UI-парсер старой CRM (Upgrade Retail Весна 2025)...');
                    return [4 /*yield*/, playwright_core_1.chromium.launch({ headless: true })];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newContext()];
                case 2:
                    context = _a.sent();
                    return [4 /*yield*/, context.newPage()];
                case 3:
                    page = _a.sent();
                    console.log('🔗 Логинимся...');
                    return [4 /*yield*/, page.goto('https://sales.upgradecrm.ru/login')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, page.fill('input[type="email"]', EMAIL)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, page.fill('input[type="password"]', PASSWORD)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, page.click('button[type="submit"]')];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, page.waitForTimeout(3000)];
                case 8:
                    _a.sent();
                    console.log('🔗 Переходим на страницу программы...');
                    return [4 /*yield*/, page.goto(TARGET_URL)];
                case 9:
                    _a.sent();
                    // Wait for the main app and program grid to load
                    return [4 /*yield*/, page.waitForSelector('#app', { timeout: 60000 })];
                case 10:
                    // Wait for the main app and program grid to load
                    _a.sent();
                    console.log('💾 Извлекаем базовые данные из состояния Inertia.js (Залы, Дни, Сессии)...');
                    return [4 /*yield*/, page.evaluate(function () {
                            var appDiv = document.querySelector('#app');
                            if (!appDiv)
                                return null;
                            try {
                                var dataPage = JSON.parse(appDiv.getAttribute('data-page') || '{}');
                                return dataPage.props;
                            }
                            catch (e) {
                                return null;
                            }
                        })];
                case 11:
                    inertiaData = _a.sent();
                    if (!!inertiaData) return [3 /*break*/, 13];
                    console.error('Не удалось извлечь данные из data-page!');
                    return [4 /*yield*/, browser.close()];
                case 12:
                    _a.sent();
                    return [2 /*return*/];
                case 13:
                    console.log('🕵️‍♂️ Начинаем обход сессий для сбора спикеров через UI-модалки...');
                    __filename = fileURLToPath(import.meta.url);
                    __dirname = path.dirname(__filename);
                    dataDir = path.resolve(__dirname, '../data');
                    if (!fs.existsSync(dataDir)) {
                        fs.mkdirSync(dataDir);
                    }
                    fs.writeFileSync(path.join(dataDir, 'urspring25_inertia.json'), JSON.stringify(inertiaData, null, 2));
                    console.log('✅ Базовый стейт сохранен в data/urspring25_inertia.json. Проверяем наличие полных данных о сессиях...');
                    // Since we don't have the EXACT DOM structure yet (the grep didn't show the grid), 
                    // let's grab the API data correctly using Inertia headers.
                    console.log('🌐 Пробуем вытащить данные через API с правильными заголовками Inertia...');
                    return [4 /*yield*/, page.evaluate(function () {
                            // Laravel csrf token usually in meta tag
                            var meta = document.querySelector('meta[name="csrf-token"]');
                            return meta ? meta.getAttribute('content') : '';
                        })];
                case 14:
                    token = _a.sent();
                    apiHeaders = {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-Inertia': 'true',
                        'X-Inertia-Version': (inertiaData === null || inertiaData === void 0 ? void 0 : inertiaData.version) || '',
                        'X-CSRF-TOKEN': token
                    };
                    _a.label = 15;
                case 15:
                    _a.trys.push([15, 18, , 19]);
                    return [4 /*yield*/, page.evaluate(function (headers) { return __awaiter(_this, void 0, void 0, function () {
                            var res;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fetch('/dashboard/program/event/16', { headers: headers })];
                                    case 1:
                                        res = _a.sent();
                                        if (res.ok)
                                            return [2 /*return*/, res.json()];
                                        return [2 /*return*/, { error: res.statusText, status: res.status }];
                                }
                            });
                        }); }, apiHeaders)];
                case 16:
                    eventResponse = _a.sent();
                    return [4 /*yield*/, page.evaluate(function (headers) { return __awaiter(_this, void 0, void 0, function () {
                            var res;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fetch('/dashboard/program/speaker_photo_list/16', { headers: headers })];
                                    case 1:
                                        res = _a.sent();
                                        if (res.ok)
                                            return [2 /*return*/, res.json()];
                                        return [2 /*return*/, { error: res.statusText, status: res.status }];
                                }
                            });
                        }); }, apiHeaders)];
                case 17:
                    speakersResponse = _a.sent();
                    output = {
                        inertiaProps: inertiaData,
                        eventApiData: eventResponse,
                        speakersApiData: speakersResponse
                    };
                    fs.writeFileSync(path.join(dataDir, 'urspring25_raw.json'), JSON.stringify(output, null, 2));
                    console.log('✅ API данные успешно выгружены!');
                    return [3 /*break*/, 19];
                case 18:
                    err_1 = _a.sent();
                    console.error('Ошибка при вызове API:', err_1);
                    return [3 /*break*/, 19];
                case 19:
                    console.log('Закрываем браузер.');
                    return [4 /*yield*/, browser.close()];
                case 20:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
run().catch(console.error);
