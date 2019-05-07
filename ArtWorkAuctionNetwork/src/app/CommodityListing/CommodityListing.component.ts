/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CommodityListingService } from './CommodityListing.service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-commoditylisting',
  templateUrl: './CommodityListing.component.html',
  styleUrls: ['./CommodityListing.component.css'],
  providers: [CommodityListingService]
})
export class CommodityListingComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
  private errorMessage;

  listingId = new FormControl('', Validators.required);
  reservePrice = new FormControl('', Validators.required);
  description = new FormControl('', Validators.required);
  state = new FormControl('', Validators.required);
  offers = new FormControl('', Validators.required);
  doneBuyer = new FormControl('', Validators.required);
  doneSeller = new FormControl('', Validators.required);
  commodity = new FormControl('', Validators.required);

  constructor(public serviceCommodityListing: CommodityListingService, fb: FormBuilder) {
    this.myForm = fb.group({
      listingId: this.listingId,
      reservePrice: this.reservePrice,
      description: this.description,
      state: this.state,
      offers: this.offers,
      doneBuyer: this.doneBuyer,
      doneSeller: this.doneSeller,
      commodity: this.commodity
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceCommodityListing.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(asset => {
        tempList.push(asset);
      });
      this.allAssets = tempList;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the asset field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the asset updateDialog.
   * @param {String} name - the name of the asset field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified asset field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.network.CommodityListing',
      'listingId': this.listingId.value,
      'reservePrice': this.reservePrice.value,
      'description': this.description.value,
      'state': this.state.value,
      'offers': this.offers.value,
      'doneBuyer': this.doneBuyer.value,
      'doneSeller': this.doneSeller.value,
      'commodity': this.commodity.value
    };

    this.myForm.setValue({
      'listingId': null,
      'reservePrice': null,
      'description': null,
      'state': null,
      'offers': null,
      'doneBuyer': null,
      'doneSeller': null,
      'commodity': null
    });

    return this.serviceCommodityListing.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'listingId': null,
        'reservePrice': null,
        'description': null,
        'state': null,
        'offers': null,
        'doneBuyer': null,
        'doneSeller': null,
        'commodity': null
      });
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
          this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else {
          this.errorMessage = error;
      }
    });
  }


  updateAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.network.CommodityListing',
      'reservePrice': this.reservePrice.value,
      'description': this.description.value,
      'state': this.state.value,
      'offers': this.offers.value,
      'doneBuyer': this.doneBuyer.value,
      'doneSeller': this.doneSeller.value,
      'commodity': this.commodity.value
    };

    return this.serviceCommodityListing.updateAsset(form.get('listingId').value, this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }


  deleteAsset(): Promise<any> {

    return this.serviceCommodityListing.deleteAsset(this.currentId)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  setId(id: any): void {
    this.currentId = id;
  }

  getForm(id: any): Promise<any> {

    return this.serviceCommodityListing.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'listingId': null,
        'reservePrice': null,
        'description': null,
        'state': null,
        'offers': null,
        'doneBuyer': null,
        'doneSeller': null,
        'commodity': null
      };

      if (result.listingId) {
        formObject.listingId = result.listingId;
      } else {
        formObject.listingId = null;
      }

      if (result.reservePrice) {
        formObject.reservePrice = result.reservePrice;
      } else {
        formObject.reservePrice = null;
      }

      if (result.description) {
        formObject.description = result.description;
      } else {
        formObject.description = null;
      }

      if (result.state) {
        formObject.state = result.state;
      } else {
        formObject.state = null;
      }

      if (result.offers) {
        formObject.offers = result.offers;
      } else {
        formObject.offers = null;
      }

      if (result.doneBuyer) {
        formObject.doneBuyer = result.doneBuyer;
      } else {
        formObject.doneBuyer = null;
      }

      if (result.doneSeller) {
        formObject.doneSeller = result.doneSeller;
      } else {
        formObject.doneSeller = null;
      }

      if (result.commodity) {
        formObject.commodity = result.commodity;
      } else {
        formObject.commodity = null;
      }

      this.myForm.setValue(formObject);

    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  resetForm(): void {
    this.myForm.setValue({
      'listingId': null,
      'reservePrice': null,
      'description': null,
      'state': null,
      'offers': null,
      'doneBuyer': null,
      'doneSeller': null,
      'commodity': null
      });
  }

}
