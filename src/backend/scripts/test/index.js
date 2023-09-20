export default async function exampleScript() {
  for (let i = 0; i < 100; i++) {
    console.log(i)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}
