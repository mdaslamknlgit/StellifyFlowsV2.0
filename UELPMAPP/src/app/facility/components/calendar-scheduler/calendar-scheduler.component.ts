import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { startOfDay,endOfDay,subDays,addDays,endOfMonth,isSameDay,isSameMonth,addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

@Component({
  selector: 'app-calendar-scheduler',
  templateUrl: './calendar-scheduler.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./calendar-scheduler.component.css']
})
export class CalendarSchedulerComponent implements OnInit,AfterViewInit {

  modalReference: NgbModalRef;
  constructor(private modal: NgbModal) { }
  eventsList: string;
  singleevent: CalendarEvent;
  id: number=0;

  ngOnInit() {
  }

  ngAfterViewInit() {
    // let calendarEvents=<CalendarEvent>JSON.parse(this.getCalendarEvents());
    let calendarEvents = JSON.parse(this.getCalendarEvents());
    //let clearObj=<CalendarEvent>JSON.parse(calendarEvents);
    calendarEvents.forEach(x => {
      x.start = new Date(x.start),
        x.end = new Date(x.end)
      this.events.push(x)
    });

    // calendarEvents.start=new Date(calendarEvents.start);
    // calendarEvents.end=new Date(calendarEvents.end);
    // this.events.push(calendarEvents);
    this.refresh.next();
  }

  @ViewChild('modalContent')
  modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };
  allmodalsData: {
    action: string;
    event: CalendarEvent[];
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        alert('clicked pencil');
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [
    // {
    //   start: subDays(startOfDay(new Date()), 1),
    //   end: addDays(new Date(), 1),
    //   title: 'A 3 day event',
    //   color: colors.red,
    //   actions: this.actions,
    //   allDay: true,
    //   resizable: {
    //     beforeStart: true,
    //     afterEnd: true
    //   },
    //   draggable: true
    // },
    // {
    //   start: startOfDay(new Date()),
    //   title: 'An event with no end date',
    //   color: colors.yellow,
    //   actions: this.actions
    // },
    // {
    //   start: subDays(endOfMonth(new Date()), 3),
    //   end: addDays(endOfMonth(new Date()), 3),
    //   title: 'A long event that spans 2 months',
    //   color: colors.blue,
    //   allDay: true
    // },
    // {
    //   start: addHours(startOfDay(new Date()), 2),
    //   end: new Date(),
    //   title: 'A draggable and resizable event',
    //   color: colors.yellow,
    //   actions: this.actions,
    //   resizable: {
    //     beforeStart: true,
    //     afterEnd: true
    //   },
    //   draggable: true
    // },
    // {
    //   start: addHours(startOfDay(new Date()), 3),
    //   end: new Date(),
    //   title: '2nd draggable and resizable event ',
    //   color: colors.yellow,
    //   actions: this.actions,
    //   resizable: {
    //     beforeStart: true,
    //     afterEnd: true
    //   },
    //   draggable: true
    // }
  ];

  activeDayIsOpen: boolean = true;

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    let action: string='clicked';
    let event : CalendarEvent[];
    event=events; 
    //this.singleevent=events[0];
    let singleevent : CalendarEvent=events[0];
    this.allmodalsData = { action,event };
    this.modal.open(this.modalContent, { size: 'lg' });

    // if (isSameMonth(date, this.viewDate)) {
    //   this.viewDate = date;
    //   if (
    //     (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
    //     events.length === 0
    //   ) {
    //     this.activeDayIsOpen = false;
    //   } else {
    //     this.activeDayIsOpen = true;
    //   }
    // }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    alert("event changed")
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, events: CalendarEvent): void {
    //alert("handle event");
    //this.modalData = { event, action };
    let event:CalendarEvent[]=[];
    //event.fill(events);
    event.push(events);
    this.allmodalsData={event,action};
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    alert('new event');
    //this.events=[];
    this.events.push({
      title: 'New event',
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      color: colors.red,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true
      }
    });
    this.refresh.next();
  }
  open(content) {
    this.modalReference = this.modal.open(content, { size: 'sm' });
  }

  getCalendarEvents(): any {
    //this.eventsList ="{ \"start\": \"2019-01-27T18:30:00.000Z\",  \"end\": \"2019-01-30T10:15:16.720Z\",  \"title\": \"A 3 day event\",  \"color\": {    \"primary\": \"#ad2121\",    \"secondary\": \"#FAE3E3\"  },  \"actions\": [    {      \"label\": \"<i class=\"fa fa-fw fa-pencil\"></i>\"    },    {      \"label\": \"<i class=\"fa fa-fw fa-times\"></i>\"    }  ],  \"allDay\": true,  \"resizable\": {    \"beforeStart\": true,    \"afterEnd\": true  },  \"draggable\": true}";
    this.eventsList = "[{   \"id\":\"12\" ,   \"start\": \"2019-01-16T18:30:00.000Z\",        \"end\": \"2019-01-19T10:15:16.720Z\",        \"title\": \"A 3 days event\",  \"color\": {\"primary\": \"#ad2121\",    \"secondary\": \"#FAE3E3\"},\"actions\": [{\"label\": \"<i class=fa fa-fw fa-pencil></i>\"}, {      \"label\": \"<i class=fa fa-fw fa-times></i>\"}  ],  \"allDay\": \"true\",\"resizable\": {    \"beforeStart\": \"true\",\"afterEnd\": \"true\"},  \"draggable\": \"true\", \"description\" : \"my first event\"}, {   \"id\":\"14\" ,   \"start\": \"2019-01-17T10:30:00.000Z\",        \"end\": \"2019-01-17T16:15:16.720Z\",        \"title\": \"single day event\",  \"color\": {\"primary\": \"#ad9520\",    \"secondary\": \"#5fad20\"},\"actions\": [{\"label\": \"<i class=fa fa-fw fa-pencil></i>\"}, {      \"label\": \"<i class=fa fa-fw fa-times></i>\"}  ],  \"allDay\": \"false\",\"resizable\": {    \"beforeStart\": \"true\",\"afterEnd\": \"true\"},  \"draggable\": \"true\",\"description\" : \"my second event\"} , { \"id\":\"15\" , \"start\": \"2019-01-31T20:30:00.000Z\",\"end\": \"2019-02-01T09:29:01.284Z\",\"title\": \"A draggable and resizable event\",\"color\": {\"primary\": \"#e3bc08\",\"secondary\": \"#FDF1BA\" },\"actions\": [ { \"label\": \"<i class=fa fa-fw fa-pencil></i>\"  }, { \"label\": \"<i class=fa fa-fw fa-times></i>\" } ], \"resizable\": { \"beforeStart\": true, \"afterEnd\": true }, \"draggable\": true }]";
    return this.eventsList;
  }
  getSelectedInfo(id: any) {
    this.id = Number(id);
  }
}
