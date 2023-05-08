import { create } from "zustand";

export const useContractorPrivate = create((set) => ({
  contractor_id: undefined,
  contractor_name: undefined,
  apartment_id: undefined,
  apartment_building: undefined,
  apartment_room: undefined,
  apartment_password: undefined,
  visit: undefined,
  sms: false,
  setContractor: (v) => {
    set({
      contractor_id: v.phone,
      contractor_name: v.name,
    });
  },
  setApartment: (v) => {
    set({
      apartment_id: v.building_room,
      apartment_building: v.building,
      apartment_room: v.room,
      apartment_password: v.password,
    });
  },
  setSMS: (v) => {
    set({ sms: v });
  },
  clear: () => {
    set({
      contractor_id: undefined,
      contractor_name: undefined,
      apartment_id: undefined,
      apartment_building: undefined,
      apartment_room: undefined,
      apartment_password: undefined,
      visit: undefined,
      sms: false,
    });
  },
}));
