import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.network{
   export class Commodity extends Asset {
      pieceId: string;
      description: string;
      mainExchange: string;
      price: number;
      pastOwners: Member[];
      owner: Member;
   }
   export enum ListingState {
      FOR_SALE,
      RESERVE_NOT_MET,
      SOLD,
   }
   export class CommodityListing extends Asset {
      listingId: string;
      reservePrice: number;
      description: string;
      state: ListingState;
      offers: Offer[];
      doneBuyer: Member;
      doneSeller: Member;
      commodity: Commodity;
   }
   export abstract class User extends Participant {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
   }
   export class Member extends User {
      balance: number;
   }
   export class Auctioneer extends User {
   }
   export class Offer extends Transaction {
      bidPrice: number;
      listing: CommodityListing;
      member: Member;
   }
   export class CloseBidding extends Transaction {
      listing: CommodityListing;
   }
// }
