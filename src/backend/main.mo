import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import OutCall "http-outcalls/outcall";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Management
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Meal Data Model
  public type Meal = {
    id : Text;
    imageFile : Storage.ExternalBlob;
    creator : Principal;
    mealName : Text;
    calories : Nat;
    timestamp : Time.Time;
  };

  module Meal {
    public func compareAscending(m1 : Meal, m2 : Meal) : Order.Order {
      Nat.compare(m1.calories, m2.calories);
    };

    public func compareDescending(m1 : Meal, m2 : Meal) : Order.Order {
      switch (Nat.compare(m1.calories, m2.calories)) {
        case (#less) { #greater };
        case (#greater) { #less };
        case (#equal) { #equal };
      };
    };
  };

  public type Meals = Map.Map<Text, Meal>;
  let meals = Map.empty<Principal, Meals>();
  public type MealId = Nat;

  // Manage Meals
  public shared ({ caller }) func createMeal(imageFile : Storage.ExternalBlob, _memType : Text, mealName : Text, calories : Nat) : async Meal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create meals");
    };

    let timestamp = Time.now();
    let id = timestamp.toText();

    let newMeal : Meal = {
      id;
      creator = caller;
      imageFile;
      mealName;
      calories;
      timestamp;
    };

    switch (meals.get(caller)) {
      case (?userMeals) {
        userMeals.add(id, newMeal);
      };
      case (null) {
        let userMeals = Map.empty<Text, Meal>();
        userMeals.add(id, newMeal);
        meals.add(caller, userMeals);
      };
    };

    newMeal;
  };

  public shared ({ caller }) func deleteMeal(mealID : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete meals");
    };

    let userMeals = switch (meals.get(caller)) {
      case (null) { Runtime.trap("Meal not found") };
      case (?userMeals) { userMeals };
    };

    if (not userMeals.containsKey(mealID)) {
      Runtime.trap("Meal not found");
    };

    userMeals.remove(mealID);
  };

  public query ({ caller }) func getAllMeals() : async [Meal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view meals");
    };

    switch (meals.get(caller)) {
      case (null) { [] };
      case (?userMeals) {
        userMeals.values().toArray();
      };
    };
  };

  // Daily Summary Functions
  public query ({ caller }) func getDailySummary() : async (Nat, Nat) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily summary");
    };

    let todayStart = Time.now() - 86400000000000; // Nanoseconds per day
    var totalCalories : Nat = 0;
    var mealCount : Nat = 0;

    switch (meals.get(caller)) {
      case (null) {};
      case (?userMeals) {
        userMeals.values().forEach(
          func(meal) {
            if (meal.timestamp >= todayStart) {
              totalCalories += meal.calories;
              mealCount += 1;
            };
          }
        );
      };
    };

    (totalCalories, mealCount);
  };
};
