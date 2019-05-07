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

'use strict';
/**
 * Write your transction processor functions here
 */

 /**
 * Close the bidding for a vehicle listing and choose the
 * highest bid that is over the asking price
 * @param {org.network.CloseBidding} closeBidding - the closeBidding transaction
 * @transaction
 */
async function closeBidding(closeBidding) {  // eslint-disable-line no-unused-vars
    const listing = closeBidding.listing;
    if (listing.state !== 'FOR_SALE') {
        throw new Error('Listing is not FOR SALE');
    }
    // by default we mark the listing as RESERVE_NOT_MET
    listing.state = 'RESERVE_NOT_MET';
    let highestOffer = null;
    let buyer = null;
    let seller = null;
    if (listing.offers && listing.offers.length > 0) {
        // sort the bids by bidPrice
        listing.offers.sort(function(a, b) {
            return (b.bidPrice - a.bidPrice);
        });
        highestOffer = listing.offers[0];
        if (highestOffer.bidPrice >= listing.reservePrice) {
            // mark the listing as SOLD
            listing.state = 'SOLD';
            buyer = highestOffer.member;
            seller = listing.commodity.owner;
            // add original owner of commodity to pastOwners
            // if not already there
            if (!listing.commodity.pastOwners) {
                listing.commodity.pastOwners = [];
                listing.commodity.pastOwners.push(buyer);
            }
            // update the balance of the seller
            console.log('#### seller balance before: ' + seller.balance);
            seller.balance += highestOffer.bidPrice;
            console.log('#### seller balance after: ' + seller.balance);
            // update the balance of the buyer
            console.log('#### buyer balance before: ' + buyer.balance);
            buyer.balance -= highestOffer.bidPrice;
            console.log('#### buyer balance after: ' + buyer.balance);
            // transfer the commodity to the buyer
            listing.commodity.owner = buyer;
            listing.commodity.pastOwners.push(seller);
            //add done buyer and seller
            listing.doneBuyer = buyer;
            listing.doneSeller = seller;
            // clear the offers
            listing.offers = null;
        }
    }

    if (highestOffer) {
        // save the commodity
        const commodityRegistry = await getAssetRegistry('org.network.Commodity');
        await commodityRegistry.update(listing.commodity);
    }

    // save the commodity listing
    const commodityListingRegistry = await getAssetRegistry('org.network.CommodityListing');
    await commodityListingRegistry.update(listing);

    if (listing.state === 'SOLD') {
        // save the buyer
        const userRegistry = await getParticipantRegistry('org.network.Member');
        await userRegistry.updateAll([buyer, seller]);
    }
}

/**
 * Make an Offer for a CommodityListing
 * @param {org.network.Offer} offer - the offer
 * @transaction
 */
async function makeOffer(offer) {  // eslint-disable-line no-unused-vars
    let listing = offer.listing;
    if (listing.state !== 'FOR_SALE') {
        throw new Error('Listing is not FOR SALE');
    }
    if (!listing.offers) {
        listing.offers = [];
    }
    listing.offers.push(offer);

    // save the vehicle listing
    const commodityListingRegistry = await getAssetRegistry('org.network.CommodityListing');
    await commodityListingRegistry.update(listing);
}