const rawData = `[
  {"id":1,"name":"Sanskar","email":"sanskar@example.com","age":20,"isActive":true},
  {"id":2,"name":"Rahul","email":"rahul@example.com","age":17,"isActive":true},
  {"id":3,"name":"Priya","email":"priya@example.com","age":22,"isActive":false},
  {"id":4,"name":"Aman","email":"aman@example.com","age":19,"isActive":true},
  {"id":5,"name":"Ranveer","email":"Ranveer@example.com","age":25,"isActive":true},
  {"id":6,"name":"Anjali","email":"anjali@example.com","age":21,"isActive":false},
  {"id":7,"name":"Riya","email":"riya@example.com","age":23,"isActive":true},
  {"id":8,"name":"Vikram","email":"vikram@example.com","age":24,"isActive":true},
  {"id":9,"name":"Neha","email":"neha@example.com","age":26,"isActive":false},
  {"id":10,"name":"Arjun","email":"arjun@example.com","age":28,"isActive":true}
]`;

const users = JSON.parse(rawData);

const cleanedUsers = users.filter(user => user.name.trim() !== "");

console.log("User Status Report:");
console.log("-------------------");

cleanedUsers.forEach(user => {
  const ageStatus = user.age >= 18 ? "Above 18" : "Below 18";
  const activeStatus = user.isActive ? "Active" : "Inactive";

  console.log(
    `${user.name} | ${ageStatus} | ${activeStatus}`
  );
});

const eligibleUsers = cleanedUsers.filter(
  user => user.age >= 18 && user.isActive
);

console.log("\nEligible Users (Above 18 & Active):");
eligibleUsers.forEach(user => {
  console.log(`${user.name} (${user.age})`);
});