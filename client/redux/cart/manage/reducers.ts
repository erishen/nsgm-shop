import * as types from "./types";
import _ from "lodash";

const initialState = {
  firstLoadFlag: true,
  cart: {
    totalCounts: 0,
    items: [],
  },
};

export const cartManageReducer = (state = initialState, { type, payload }) => {
  const cart = state.cart || { totalCounts: 0, items: [] };
  const { totalCounts, items } = cart;
  let newItems: any = [];

  switch (type) {
    case types.UPDATE_SSR_CART:
      return {
        ...state,
        firstLoadFlag: true,
        cart: payload.cart,
      };
    case types.GET_CART_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        cart: payload.cart,
      };
    case types.SEARCH_CART_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        cart: payload.cart,
      };
    case types.ADD_CART_SUCCEEDED:
      newItems = [...items];
      newItems.push(payload.cart);
      return {
        ...state,
        firstLoadFlag: false,
        cart: {
          totalCounts: totalCounts + 1,
          items: newItems,
        },
      };
    case types.MOD_CART_SUCCEEDED:
      const modItem = payload.cart;

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
        cart: {
          totalCounts: totalCounts,
          items: newItems,
        },
      };
    case types.DEL_CART_SUCCEEDED:
      const delItemId = payload.id;

      _.each(items, (item: any) => {
        if (item.id != delItemId) {
          newItems.push(item);
        }
      });

      return {
        ...state,
        firstLoadFlag: false,
        cart: {
          totalCounts: totalCounts - 1,
          items: newItems,
        },
      };
    case types.BATCH_DEL_CART_SUCCEEDED:
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
        cart: {
          totalCounts: newTotalCounts,
          items: newItems,
        },
      };
    default:
      return state;
  }
};
