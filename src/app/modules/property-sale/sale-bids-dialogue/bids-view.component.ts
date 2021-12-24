import { AfterViewInit, Component, Inject, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { CommonDialogComponent } from 'src/app/common-dialog/common-dialog.component';
import { SaleBid } from 'src/app/model/SaleBid';
import { ConfirmationDialogService } from 'src/app/services/conformatioDialog/confirmation-dialog.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { UserService } from 'src/app/services/userService/user.service';
import { PropertySaleBidService } from 'src/app/services/propertyService/property.sale.bid.service';
import { UpdateSaleBidPropertyComponent } from 'src/app/modules/sale-bid/update/update-sale.bid.component';

@Component({
  selector: 'app-bids-view',
  templateUrl: './bids-view.component.html',
  styleUrls: ['./bids-view.component.css']
})
export class BidsViewComponent implements OnInit, AfterViewInit {

  public dataSource = new MatTableDataSource<SaleBid>();

  @ViewChild(MatSort) sort:MatSort;
  @ViewChild(MatPaginator) paginator:MatPaginator;
  id:any;
  filterText = '';
  salePropertyId:any;
  loginId:any;
  displayedColumns = ['propertyId', 'propertyName', 'saleUnits', 'qtyPrice', 'bidOwnerName', 'requiredUnits', 'priceQuotation', 'Actions'];

  constructor(private service:PropertySaleBidService, public dialog:MatDialog, private route:ActivatedRoute,
              private loaderSer:LoaderService, private dialogSer:ConfirmationDialogService, private userService:UserService) {

    this.ngOnInit();
  }

  ngOnInit():void {
    //this.salePropertyId = this.data;
    this.loginId = window.sessionStorage.getItem('loginId');
    this.loadData();
  }

  loadData()
  {
    this.dataSource.filterPredicate = function (data, filter:string):boolean {
      return data.requiredUnits.toString().toLowerCase().includes(filter) ||
        data.priceQuotation.toString().toLowerCase().includes(filter) ||
        data.property.name.toString().toLowerCase().includes(filter) ||
        data.property.propertyId.toString().toLowerCase().includes(filter)
    };
    this.getAllSaleBidProperties();
  }

  ngAfterViewInit()
  {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue:string){
    this.filterText = filterValue.trim();
    filterValue = this.filterText.toLowerCase();
    this.dataSource.filter = filterValue;

    this.getAllSaleBidProperties();
  }

  getAllSaleBidProperties()
  {
    this.loaderSer.showNgxSpinner();
    this.service.getPropertySaleBidsBySaleAndStatus(this.salePropertyId, 'NEW').subscribe((data) => {
      this.dataSource.data = data;
      this.loaderSer.hideNgxSpinner();
    }, (error) => {
      console.log(error);
      this.loaderSer.hideNgxSpinner();
    });
  }

  approve(bidSale)
  {
    this.loaderSer.showNgxSpinner();
    bidSale.status = "APPROVE";
    this.service.approveBid(bidSale.id, bidSale).subscribe((data) => {
      this.ngOnInit();
      this.loaderSer.hideNgxSpinner();
    }, (error) => {
      console.log(error);
      this.loaderSer.hideNgxSpinner();
      this.loaderSer.showFailureSnakbar(error.error.message);
    })
  }

  result:string = '';
}

@Pipe({
  name: 'highlightSearch2'
})
export class HighlightSearchPipe2 implements PipeTransform {
  constructor() {
  }

  transform(value:string, search:string):string {
    const valueStr = value + ''; // Ensure numeric values are converted to strings
    return valueStr.replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + search + ')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<strong class="text-highlight">$1</strong>');
  }
}
