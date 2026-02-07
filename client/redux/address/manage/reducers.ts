import * as types from "./types";
import _ from "lodash";

const initialState = {
  firstLoadFlag: true,
  address: {
    totalCounts: 0,
    items: [],
  },
};

export const addressManageReducer = (state = initialState, { type, payload }) => {
  const address = state.address || { totalCounts: 0, items: [] };
  const { totalCounts, items } = address;
  let newItems: any = [];

  switch (type) {
    case types.UPDATE_SSR_ADDRESS:
      return {
        ...state,
        firstLoadFlag: true,
        address: payload.address,
      };
    case types.GET_ADDRESS_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        address: payload.address,
      };
    case types.SEARCH_ADDRESS_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        address: payload.address,
      };
    case types.ADD_ADDRESS_SUCCEEDED:
      newItems = [...items];
      newItems.push(payload.address);
      return {
        ...state,
        firstLoadFlag: false,
        address: {
          totalCounts: totalCounts + 1,
          items: newItems,
        },
      };
    case types.MOD_ADDRESS_SUCCEEDED:
      const modItem = payload.address;

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
        address: {
          totalCounts: totalCounts,
          items: newItems,
        },
      };
    case types.DEL_ADDRESS_SUCCEEDED:
      const delItemId = payload.id;

      _.each(items, (item: any) => {
        if (item.id != delItemId) {
          newItems.push(item);
        }
      });

      return {
        ...state,
        firstLoadFlag: false,
        address: {
          totalCounts: totalCounts - 1,
          items: newItems,
        },
      };
    case types.BATCH_DEL_ADDRESS_SUCCEEDED:
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
        address: {
          totalCounts: newTotalCounts,
          items: newItems,
        },
      };
    default:
      return state;
  }
};
