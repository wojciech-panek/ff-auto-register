const casper = require('casper').create({
    verbose: true,
});

const OPTIONS = {
    BASE_URL: 'https://fabrykaformy.perfectgym.pl/ClientPortal2',
    RANDOM_ITEM_ID: 'random_id_' + new Date().getTime(),
    USERNAME: casper.cli.get('user'),
    PASSWORD: casper.cli.get('password'),
    CLUB_ID: casper.cli.get('club'),
    DAY: casper.cli.get('day'),
    HOUR: casper.cli.get('hour'),
    CLASSES_NAME: casper.cli.get('classes'),
};

const ELEMENTS = {
    MAIN_WRAPPER: '.cp-main-wrapper',
    AUTH_FORM: '.auth-login-form',
    INPUT_LOGIN: 'input[name=Login]',
    INPUT_PASSWORD: 'input[name=Password]',
    PROFILE_ICON: '.glyphicon-cp-profile',
    CALENDAR_ITEM: '.cp-calendar-item',
    CALENDAR_ITEM_HOUR: '.calendar-item-start',
    CALENDAR_ITEM_NAME: '.calendar-item-name',
    CALENDAR_ITEM_UNAVAILABLE: '.is-unavailable',
    CALENDAR_ITEM_BOOKED: '.is-booked',
    CALENDAR_ITEM_BUTTON: '.cp-icon-btn-classes-action',
};

const MESSAGES = {
    LOGIN_TIMEOUT: 'Błąd: nie udało się zalogować',
    CALENDAR_REDIRECT_TIMEOUT: 'Błąd: nie udało się wyświetlić listy zajęć',
    CALENDAR_ITEM_UNAVAILABLE: 'Uwaga: Zajęcia nie są dostępne chwilowo dostępne',
    CALENDAR_ITEM_BOOKED: 'Uwaga: Zajęcia są już zarezerwowane',
    CALENDAR_ITEM_RESERVED_TIMEOUT: 'Błąd: nie udało się zarezerwować zajęć',
    CALENDAR_ITEM_NOT_FOUND: 'Błąd: nie udało się odnaleźć zajęć',
    CALENDAR_ITEM_SUCCESS: 'Sukces: zarezerwowano zajęcia',
    INVALID_STATE: 'Błąd: nie udało się wyświetlić strony',
};

const getProperDayUrl = function () {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const date = year + '-' + month + '-' + OPTIONS.DAY + 'T00:00:00';
    return OPTIONS.BASE_URL + '/#/Classes/' + OPTIONS.CLUB_ID + '/Calendar?date=' + date;
};

const log = function (message) {
    const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    casper.echo('[' + date + '] ' + message);
};

const signIn = function() {
    const formValues = {};
    formValues[ELEMENTS.INPUT_LOGIN] = OPTIONS.USERNAME;
    formValues[ELEMENTS.INPUT_PASSWORD] = OPTIONS.PASSWORD;

    casper.fillSelectors(ELEMENTS.AUTH_FORM, formValues, true);

    casper.sendKeys(ELEMENTS.INPUT_PASSWORD, casper.page.event.key.Enter);

    casper.waitForSelector(ELEMENTS.PROFILE_ICON, function() {
        navigateToClassesCalendarTab();
    }, function() {
        log(MESSAGES.LOGIN_TIMEOUT);
    });
};

const navigateToClassesCalendarTab = function() {
    casper.open(getProperDayUrl());

    casper.waitForSelector(ELEMENTS.CALENDAR_ITEM, function() {
        reserveItem();
    }, function() {
        logc(MESSAGES.CALENDAR_REDIRECT_TIMEOUT);
    })
};

const addIdToCurrentItem = function() {
    casper.evaluate(function(itemSelector, hourSelector, classesNameSelector, hour, classesName, newId) {
        const calendarItems = document.querySelectorAll(itemSelector);

        for (var i = 0; i < calendarItems.length; i++) {
            const hourElement = calendarItems[i].querySelector(hourSelector);
            const classesNameElement = calendarItems[i].querySelector(classesNameSelector);

            const hasValidHour = hourElement.innerText === hour;
            const hasValidName = classesNameElement.innerText.toLowerCase().indexOf(classesName.toLowerCase()) !== -1;

            if (hasValidHour && hasValidName) {
                calendarItems[i].id = newId;
                return true;
            }
        }

        return false;
    },
        ELEMENTS.CALENDAR_ITEM,
        ELEMENTS.CALENDAR_ITEM_HOUR,
        ELEMENTS.CALENDAR_ITEM_NAME,
        OPTIONS.HOUR,
        OPTIONS.CLASSES_NAME,
        OPTIONS.RANDOM_ITEM_ID
    );
};

const reserveItem = function() {
    casper.wait(2000, function() {
        addIdToCurrentItem();

        if (casper.exists('#' + OPTIONS.RANDOM_ITEM_ID)) {
            if (casper.exists('#' + OPTIONS.RANDOM_ITEM_ID + ELEMENTS.CALENDAR_ITEM_UNAVAILABLE)) {
                log(MESSAGES.CALENDAR_ITEM_UNAVAILABLE);
            } else if (casper.exists('#' + OPTIONS.RANDOM_ITEM_ID + ELEMENTS.CALENDAR_ITEM_BOOKED)) {
                log(MESSAGES.CALENDAR_ITEM_BOOKED);
            } else {
                casper.click('#' + OPTIONS.RANDOM_ITEM_ID + ' ' + ELEMENTS.CALENDAR_ITEM_BUTTON);

                casper.waitForSelector('#' + OPTIONS.RANDOM_ITEM_ID + ELEMENTS.CALENDAR_ITEM_BOOKED, function() {
                    log(MESSAGES.CALENDAR_ITEM_SUCCESS);
                    casper.exit();
                }, function() {
                    log(MESSAGES.CALENDAR_ITEM_RESERVED_TIMEOUT);
                });
            }
        } else {
            log(MESSAGES.CALENDAR_ITEM_NOT_FOUND);
        }
    });
};

const runIteration = function() {
    casper.open(OPTIONS.BASE_URL);
    casper.waitForSelector(ELEMENTS.MAIN_WRAPPER, function() {
        casper.wait(2000, function() {
            if (casper.exists(ELEMENTS.AUTH_FORM)) {
                signIn();
            } else if (casper.exists(ELEMENTS.PROFILE_ICON)) {
                navigateToClassesCalendarTab();
            } else {
                log(MESSAGES.INVALID_STATE);
            }
        });
    }, function() {
        log(MESSAGES.INVALID_STATE);
    });

    casper.wait(5 * 60 * 1000, function() {
        runIteration();
    });
};

casper.start(OPTIONS.BASE_URL);
runIteration();
casper.run();