import * as types from "./types";
import _ from "lodash";

const initialState = {
  firstLoadFlag: true,
  product: {
    totalCounts: 0,
    items: [],
  },
};

export const productManageReducer = (state = initialState, { type, payload }) => {
  const product = state.product || { totalCounts: 0, items: [] };
  const { totalCounts, items } = product;
  let newItems: any = [];

  switch (type) {
    case types.UPDATE_SSR_PRODUCT:
      return {
        ...state,
        firstLoadFlag: true,
        product: payload.product,
      };
    case types.GET_PRODUCT_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        product: payload.product,
      };
    case types.SEARCH_PRODUCT_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        product: payload.product,
      };
    case types.ADD_PRODUCT_SUCCEEDED:
      newItems = [...items];
      newItems.push(payload.product);
      return {
        ...state,
        firstLoadFlag: false,
        product: {
          totalCounts: totalCounts + 1,
          items: newItems,
        },
      };
    case types.MOD_PRODUCT_SUCCEEDED:
      const modItem = payload.product;

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
        product: {
          totalCounts: totalCounts,
          items: newItems,
        },
      };
    case types.DEL_PRODUCT_SUCCEEDED:
      const delItemId = payload.id;

      _.each(items, (item: any) => {
        if (item.id != delItemId) {
          newItems.push(item);
        }
      });

      return {
        ...state,
        firstLoadFlag: false,
        product: {
          totalCounts: totalCounts - 1,
          items: newItems,
        },
      };
    case types.BATCH_DEL_PRODUCT_SUCCEEDED:
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
        product: {
          totalCounts: newTotalCounts,
          items: newItems,
        },
      };
    default:
      return state;
  }
};
