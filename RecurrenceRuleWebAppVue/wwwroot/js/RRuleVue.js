import { RRuleViewModel } from "./RruleViewModel.js"; //.js? https://github.com/microsoft/TypeScript/pull/35148 https://forum.freecodecamp.org/t/modules-pattern-es6-browser-cant-find-a-file-path/315998
import { RRuleWrapper } from "./RRuleTypes.js";
import { RRuleHttpClient } from "./rrule-http-client.js";
import { RRuleButtonGroup } from "./RRuleButtonGroup.js";
import * as rrbg from "./RRuleButtonGroup.js";
let rruleViewModel = new RRuleViewModel();
let viewModel = new Vue({
    el: '#recurring-rule',
    components: {
        'rrule-button-group': RRuleButtonGroup
    },
    data: rruleViewModel,
    mounted() {
        Vue.nextTick(function () {
            rrbg.prepareBtnClass();
        });
        //besser in cshtml
        //Vue.nextTick(function () {
        //    //https://discuss.appstudio.dev/t/bootstrap-button-click-in-mobile-sticks/575/4
        //    //btnhlp.prepareBtn()
        //    var btns = Array.from(document.getElementsByClassName('btn'));
        //    for (const btn of btns) {
        //        const hTMLElement = <HTMLElement>btn;
        //        hTMLElement.addEventListener("click", function () {
        //            hTMLElement.blur();
        //            let msg = `${hTMLElement.innerText}: mounted click blur`
        //            console.log(msg);
        //            rruleViewModel.BtnProblemInfo = msg
        //        });
        //        hTMLElement.addEventListener("touchstart", function () {
        //            hTMLElement.classList.remove("mobileHoverFix");
        //            let msg = `${hTMLElement.innerText}: mounted touchstart`
        //            console.log(msg);
        //            rruleViewModel.BtnProblemInfo = msg
        //        });
        //        hTMLElement.addEventListener("touchend", function () {
        //            hTMLElement.classList.add("mobileHoverFix");
        //            let msg = `${hTMLElement.innerText}: mounted touchend`
        //            console.log(msg);
        //            rruleViewModel.BtnProblemInfo = msg
        //        });
        //    }
        //});
        //Vue.nextTick(function () {
        //    // I want to access props here but it return 0 length array 
        //    let vm = this;
        //    //console.log(vm.$parent.Subscriptions);
        //    $(".btn").on("click", function () {
        //        console.log("mounted click blur");
        //        $(this).blur(); // basically George's solution, but for all BS buttons
        //    });
        //    $(".btn").on("touchstart", function () {
        //        console.log("mounted touchstart");
        //        $(this).removeClass("mobileHoverFix");
        //    });
        //    $(".btn").on("touchend", function () {
        //        console.log("mounted touchend");
        //        $(this).addClass("mobileHoverFix");
        //    });
        //});
    },
    methods: {
        ResetForm() {
            this.Starttime = new Date();
        },
        Toggle(item) {
            item.checked = !item.checked;
            this.SubmitRRuleValues();
        },
        ToggleTest(item) {
            item.checked = !item.checked;
            this.SubmitRRuleValues();
            alert(`${item.value}: active? ${item.checked}`);
        },
        SetFromRRuleCodeSample() {
            rruleViewModel.Starttime = "2020-10-08T19:30:00";
            rruleViewModel.NewRRuleCode = "FREQ=WEEKLY;COUNT=30;BYDAY=TU";
            this.SetRuleByCode();
        },
        SetRuleByCode() {
            let rRuleHttpClient = new RRuleHttpClient();
            rRuleHttpClient.getRecurrencePattern(rruleViewModel.NewRRuleCode)
                //rRuleHttpClient.getRecurrencePattern(rruleViewModel.RRuleCode)
                .then((recurrencePattern) => {
                rruleViewModel.assignRuleValue(recurrencePattern);
                this.SubmitRRuleValues();
            })
                .catch((error) => {
                //throw error;
                console.log(error.message);
                rruleViewModel.RRuleError = error.message;
                //rruleViewModel.ShowReccuringEvent = true
            });
        },
        SubmitRRuleValues() {
            let rRuleWrapper = getRRuleWrapper(rruleViewModel);
            let rRuleHttpClient = new RRuleHttpClient();
            rRuleHttpClient.createRRule(rRuleWrapper)
                .then((rRuleResult) => {
                if (rRuleResult.ErrorText !== '')
                    console.log(rRuleResult.ErrorText);
                rruleViewModel.RRuleCode = rRuleResult.RecurrencePatternString;
                rruleViewModel.RRuleText = rRuleResult.RecurrencePatternText;
                rruleViewModel.RRuleOutput = getDateTimeArray(rRuleResult.RecurrencePatternList);
                rruleViewModel.RRuleHint = rRuleResult.HintText;
                rruleViewModel.RRuleError = rRuleResult.ErrorText;
                //rruleViewModel.ShowReccuringEvent = true
            })
                .catch((error) => {
                //throw error;
                console.log(error.message);
                rruleViewModel.RRuleError = error.message;
                //rruleViewModel.ShowReccuringEvent = true
            });
        }
    }
});
function getRRuleWrapper(rRuleViewModel) {
    let rRuleWrapper = new RRuleWrapper();
    rRuleWrapper.StartDate = rRuleViewModel.Starttime;
    rRuleWrapper.Frequency = rRuleViewModel.SelectedFrequency;
    rRuleWrapper.Interval = rRuleViewModel.EveryRuleInterval;
    switch (rRuleWrapper.Frequency) {
        case "weekly":
            rRuleWrapper.ByDayValue = rRuleViewModel.WeekDays.filter(i => i.checked).map(i => i.value);
            break;
        case "monthly":
            switch (rRuleViewModel.MonthlyOptions) {
                case "monthly-days":
                    rRuleWrapper.ByMonthDay = rRuleViewModel.MonthDays.filter(i => i.checked).map(i => i.value);
                    break;
                case "monthly-precise":
                    rRuleWrapper.BySetPosition.push(rRuleViewModel.SelectedMonthByDayPos);
                    rRuleWrapper.ByDayValue.push(rRuleViewModel.SelectedMonthByDayPosName);
                    break;
            }
            break;
        case "yearly":
            switch (rRuleViewModel.YearlyOptions) {
                case "yearly-one-month":
                    rRuleWrapper.ByMonth.push(rRuleViewModel.SelectedYearlyByMonth);
                    rRuleWrapper.ByMonthDay.push(rRuleViewModel.SelectedYearlyByMonthDay);
                    break;
                case "yearly-multiple-months":
                    rRuleWrapper.ByMonth = rRuleViewModel.YearlyMultipleMonths.filter(i => i.checked).map(i => i.value);
                    break;
                case "yearly-precise":
                    rRuleWrapper.BySetPosition.push(rRuleViewModel.SelectedYearlyBySetPos);
                    rRuleWrapper.ByDayValue.push(rRuleViewModel.SelectedYearlyByDay);
                    rRuleWrapper.ByMonth.push(rRuleViewModel.SelectedYearlyByMonthWithBySetPosByDay);
                    break;
            }
            break;
    }
    switch (rRuleViewModel.SelectedEndRule) {
        case "never":
            break;
        case "occurrences":
            rRuleWrapper.Count = rRuleViewModel.EndRuleOccurrences;
            break;
        case "until":
            rRuleWrapper.Until = rRuleViewModel.EndRuleUntil; //erstmal nur für Format 2020-12-31
            break;
    }
    return rRuleWrapper;
}
function getDateTimeArray(list) {
    let result = new Array(list.length);
    const optionsWeekDay = { weekday: 'long' };
    const optionsDate = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const optionsTime = { hour: '2-digit', minute: '2-digit' };
    for (let i = 0; i < list.length; i++) {
        let d = new Date(list[i]);
        result[i] = [d.toLocaleString(undefined, optionsWeekDay), d.toLocaleString(undefined, optionsDate), d.toLocaleString(undefined, optionsTime)];
    }
    return result;
}
//viewModel.SubmitRRuleValues()
export { viewModel };
//# sourceMappingURL=RRuleVue.js.map