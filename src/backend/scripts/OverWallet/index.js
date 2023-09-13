import start from "@/utils/mail"

export default function main() {
  const mail = new start("karlenejacobsenfhee@gmail.com")
  mail.checkCredentialsAndTokenExist().then(res => {
    console.log(res)
  })
}
