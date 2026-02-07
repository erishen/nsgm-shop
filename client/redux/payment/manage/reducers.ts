import * as types from "./types";
import _ from "lodash";

const initialState = {
  firstLoadFlag: true,
  payment: {
    totalCounts: 0,
    items: [],
  },
};

export const paymentManageReducer = (state = initialState, { type, payload }) => {
  const payment = state.payment || { totalCounts: 0, items: [] };
  const { totalCounts, items } = payment;
  let newItems: any = [];

  switch (type) {
    case types.UPDATE_SSR_PAYMENT:
      return {
        ...state,
        firstLoadFlag: true,
        payment: payload.payment,
      };
    case types.GET_PAYMENT_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        payment: payload.payment,
      };
    case types.SEARCH_PAYMENT_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        payment: payload.payment,
      };
    case types.ADD_PAYMENT_SUCCEEDED:
      newItems = [...items];
      newItems.push(payload.payment);
      return {
        ...state,
        firstLoadFlag: false,
        payment: {
          totalCounts: totalCounts + 1,
          items: newItems,
        },
      };
    case types.MOD_PAYMENT_SUCCEEDED:
      const modItem = payload.payment;

      _.each(items, (item: any) => {
        if (item.id == modItem.id) {
          newItems.push(modItem);
        } else {
          newItems.push(item);
        }
      });
      return {
        ...state,
        firstLoadFlag: false,
        payment: {
          totalCounts: totalCounts,
          items: newItems,
        },
      };
    case types.DEL_PAYMENT_SUCCEEDED:
      const delItemId = payload.id;

      _.each(items, (item: any) => {
        if (item.id != delItemId) {
          newItems.push(item);
        }
      });

      return {
        ...state,
        firstLoadFlag: false,
        payment: {
          totalCounts: totalCounts - 1,
          items: newItems,
        },
      };
    case types.BATCH_DEL_PAYMENT_SUCCEEDED:
      const delItemIds = payload.ids;
      const allIds = _.map(
        _.map(items, (item) => _.pick(item, ["id"])),
        "id"
      );
      const diffIds = _.xor(allIds, delItemIds);

      newItems = _.filter(items, (item: any) => _.includes(diffIds, item.id));

      let newTotalCounts = totalCounts - delItemIds.length;
      if (newTotalCounts < 0) newTotalCounts = 0;

      return {
        ...state,
        firstLoadFlag: false,
        payment: {
          totalCounts: newTotalCounts,
          items: newItems,
        },
      };
    default:
      return state;
  }
};
