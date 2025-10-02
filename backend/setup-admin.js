import fetch from "node-fetch";

const createAdmin = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Admin User",
        email: "kabriacid01@gmail.com",
        password: "Pa$$w0rd!",
      }),
    });

    const data = await response.json();
    console.log("Response:", data);

    if (data.success) {
      console.log(
        "\nAdmin account created successfully! You can now login with:"
      );
      console.log("Email:", "kabriacid01@gmail.com");
      console.log("Password:", "Pa$$w0rd!");
    } else {
      console.log("\nError creating admin account:", data.message);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

createAdmin();
