import { AfterViewInit, Component, OnInit, Pipe, PipeTransform, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { HomeService } from 'src/app/services/home/home.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { NewPropertyComponent } from 'src/app/modules/property/new/new-property.component';
import { SaleBid } from 'src/app/model/SaleBid';
import { Property } from 'src/app/model/Property';
import { PropertySale } from 'src/app/model/PropertySale';
import { PropertyService } from 'src/app/services/propertyService/property.service';
import { UpdatePropertyComponent } from 'src/app/modules/property/update/update-property.component';
import { AuthenticationService } from 'src/app/services/authService/authentication.service';
import { ConfirmationDialogService } from 'src/app/services/conformatioDialog/confirmation-dialog.service';
import { PropertySaleService } from 'src/app/services/propertyService/property.sale.service';
import { PropertySaleBidService } from 'src/app/services/propertyService/property.sale.bid.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns = ['propertyId', 'name', 'units', 'category', 'direction', 'address', 'city', 'state', 'country', 'propertyType', 'status', 'Actions'];

  public dataSource = new MatTableDataSource<Property>();

  @ViewChild(MatSort) sort:MatSort;
  @ViewChild(MatPaginator) paginator:MatPaginator;
  sortProperty:'desc';
  id:any;
  propertyType:String;
  filterText = '';
  isAdmin:Boolean;
  userName:String;
  type = 'properties';
  opened;
  any;
  properties: Property[] = [];;
  saleProperties: PropertySale[] = [];
  salePropertyBids: SaleBid[] = [];

  constructor(private propService:PropertyService, public dialog:MatDialog, private route:ActivatedRoute, private loaderSer:LoaderService,
              private homeService:HomeService, private authService:AuthenticationService, private dialogSer:ConfirmationDialogService, private saleService:PropertySaleService,
              private bidService:PropertySaleBidService) {

    this.route.params.subscribe(params => {
      this.ngOnInit();
    });
  }

  ngOnInit():void {
    if (this.authService.isAdmin == null)this.authService.isAdmin = window.sessionStorage.getItem('isAdmin').toLowerCase() == 'true';
    this.isAdmin = this.authService.isAdmin;
    if (this.authService.username == null)this.authService.username = window.sessionStorage.getItem('firstName');
    this.userName = this.authService.username;
    if (this.isAdmin) {
      this.loadData();
    } else {
      this.getUserProperties();
      this.getUserSaleProperties();
      this.getUserBidProperties();
    }

  }

  getUserProperties() {
    this.loaderSer.showNgxSpinner();
    this.propService.getUserProperties(window.sessionStorage.getItem('loginId'), this.pageable).subscribe((data) => {
      this.properties = data.content;
      this.loaderSer.hideNgxSpinner();
    }, (error) => {
      console.log(error);
      this.loaderSer.hideNgxSpinner();
    });
  }

  getUserSaleProperties() {
    this.loaderSer.showNgxSpinner();
    this.saleService.getPropertySalesByOwner(window.sessionStorage.getItem('loginId'), this.pageable).subscribe((data) => {
      this.saleProperties = data;
      this.loaderSer.hideNgxSpinner();
    }, (error) => {
      console.log(error);
      this.loaderSer.hideNgxSpinner();
    });
  }

  getUserBidProperties() {
    this.loaderSer.showNgxSpinner();
    this.bidService.getPropertySaleBidsByOwner(window.sessionStorage.getItem('loginId'), this.pageable).subscribe((data) => {
      this.salePropertyBids = data;
      console.log(data.content);
      this.loaderSer.hideNgxSpinner();
    }, (error) => {
      console.log(error);
      this.loaderSer.hideNgxSpinner();
    });
  }

  loadData() {
    this.dataSource.filterPredicate = function (data, filter:string):boolean {
      return data.name.toLowerCase().includes(filter) ||
        data.propertyId.toString().includes(filter)
    };
    this.getAllProperties();
  }

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  pageable = {
    page: 0,
    size: 99999,
    sort: {
      field: "modifiedDate",
      order: "DESC"
    }
  };

  // ------------ Filter method ----------------//
  applyFilter(filterValue:string) {
    this.filterText = filterValue.trim();
    filterValue = this.filterText.toLowerCase();
    this.dataSource.filter = filterValue;
    this.getAllProperties();
  }

  getAllProperties() {
    if (this.isAdmin) {
      //this.loaderSer.showNgxSpinner();
      this.propService.getNewProperties(this.pageable).subscribe((data) => {
        this.dataSource.data = data.content;
        this.loaderSer.hideNgxSpinner();
      }, (error) => {
        console.log(error);
        this.loaderSer.hideNgxSpinner();
      });
    }

  }


  result:string = '';

  newProperty() {
    const dialogRef = this.dialog.open(NewPropertyComponent, {disableClose: true, hasBackdrop: true, width: '1000px'});
    dialogRef.beforeClosed().subscribe((dialogResult) => {
      this.result = dialogResult;
      if (this.result == 'success') {
        this.ngOnInit();
        this.loaderSer.showSucessSnakbar("Property created Successfully");
      }
    });
  }

  ngOnDestroy() {
    this.loaderSer.isHomeActive.next(false);
  }

  approve(element) {
    const msg = `Are you sure you want to approve this property ?` + '  ' + element.name;
    const title = "Property Approve Confirm Action";

    this.dialogSer.openConfirmationDialog(msg, title).afterClosed().subscribe(res => {
      if (res) {
        this.loaderSer.showNgxSpinner();
        element.status = 'APPROVE';
        this.propService.updateProperty(element.id, element).subscribe((data) => {
          this.loaderSer.hideNgxSpinner();
          this.ngOnInit();
        }, (error) => {
          console.log(error);
          this.loaderSer.hideNgxSpinner();
          this.loaderSer.showFailureSnakbar(error.error.message);
        })
      }
    });
  }
}


