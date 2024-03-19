import { Component, OnInit } from '@angular/core';
// import { GanttComponent, GanttConfiguration, GanttTaskItem, GanttTaskLink, GanttEvents } from 'gantt-ui-component';
@Component({
  selector: 'app-project-ganttchart',
  templateUrl: './project-ganttchart.component.html',
  styleUrls: ['./project-ganttchart.component.css']
})
export class ProjectGanttchartComponent implements OnInit {
  tasks = [
    { id: 1, title: "Demolition", start_date: "2018-07-01 00:00", end_date: "2018-09-30", progress: 0.5 },
    { id: 2, title: "Plumbing", start_date: "2018-07-10 00:00", end_date: "2018-09-10", progress: 0.8 },
    { id: 3, title: "Electrical", start_date: "2018-07-15 00:00", end_date: "2018-09-05", progress: 0.4 },
    { id: 4, title: "Flooring", start_date: "2018-07-20 00:00", end_date: "2018-08-31", progress: 1 },
    { id: 5, title: "DryWall", start_date: "2018-08-01 00:00", end_date: "2018-09-25", progress: 0.6 },
    { id: 6, title: "Painting", start_date: "2018-08-14 00:00", end_date: "2018-08-31", progress: 0.5 },
    { id: 7, title: "Cabinets", start_date: "2018-08-20 00:00", end_date: "2018-10-10", progress: 0.2 },
  ];
  
  links = [

  ];

  // gantt_configuration: GanttConfiguration = {
  //   chartTitle: "Project Gantt Chart",
  //   heading_label: "Tasks",
  //   details_on_dblclick: true,
  //   show_chart: true,
  //   show_grid: true,
  //   static_background: true

  // }
  constructor() { }

  ngOnInit() {
  }

  taskAction(event) {

  }

  taskSelected(event) {

  }

  createNewTask(event) {

  }

  linkAction(event) {

  }

  linkSelected(event) {

  }

}
