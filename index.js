//módulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

//módulos internos
const fs = require('fs')

// Execução
console.clear()
console.log()
operation()


// Funções
function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: [
                'Criar Conta',
                'Consultar Saldo',
                'Depositar',
                'Sacar',
                'Sair'
            ]
        }
    ])
        .then((answer) => {
            const action = answer['action']

            if (action === 'Criar Conta') {
                createAccount()
            } else if (action === 'Consultar Saldo') {
                getAccountBalance()
            } else if(action === 'Depositar') {
                deposit()
            } else if(action === 'Sacar') {
                withdraw()
            } else if(action === 'Sair') {
                console.clear()
                console.log()
                console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
                console.log()
                process.exit()
            }

        })
        .catch(err => console.log(err))
}

// create an account
function createAccount() {
    console.clear()
    console.log()
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso Banco!'))
    console.log()
    console.log(chalk.green('Defina as opções da sua conta a seguir:'))
    buildAccount()
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para sua conta:'
        }
    ])
        .then((answer) => {
            const accountName = answer['accountName']
            console.info(accountName)

            if (!fs.existsSync('accounts')) {
                fs.mkdirSync('accounts')
            }

            if (fs.existsSync(`accounts/${accountName}.json`)) {
                console.clear()
                console.log()
                console.log(
                    chalk.bgRed.black('Esta conta já existe! escolha outro nome.')
                )
                console.log()
                buildAccount()
                return
            }

            fs.writeFileSync(
                `accounts/${accountName}.json`,
                '{"balance": 0}',
                (err) => {
                    console.log(err)
                }
            )
            console.clear()
            console.log()
            console.log(chalk.green(`Parabéns ${accountName}! A Sua Conta Foi Criada!`))
            console.log()
            operation()
        })


        .catch(err => console.log(err))
}

// Add an amount to user account
function deposit() {
    inquirer.prompt([
        {
            name:  'accountName',
            message: 'Qual o nome de sua conta?'
        }
    ])
    .then((answer) => {

        const accountName = answer['accountName']

        // Verufy if account exist
        if(!checkAccount(accountName)) {
            return deposit()        
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar?'
            }
        ])
        .then((answer) => {
            const amount = answer['amount']

            // aad an amount
            addAmount(accountName, amount)
            operation()
        })
        .catch(err=>console.log(err))

    })
    .catch(err => console.log(err))

}


function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.clear()
        console.log()
        console.log(chalk.bgRed.black('Esta conta não existe!'))
        console.log()
        return false
    }

    return true
}


function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if(!amount) {
        console.clear()
        console.log()
        console.log(
            chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!')
        )
        console.log()
        return deposit()
    }
    
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(`accounts/${accountName}.json`,
        JSON.stringify(accountData),
        err => console.log(err)
    )
    console.clear()
    console.log()
    console.log(chalk.green(`Foi depositado o valor de R$${amount},00 na sua conta`))
    console.log()
}


function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}


// Show Account balance
function getAccountBalance() {
    console.clear()
    console.log()
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        // Verify if account exists
        if(!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)
        console.clear()
        console.log()
        console.log(chalk.bgBlue.black(`O saldo da sua conta é R$${accountData.balance},00`))
        console.log()
        operation()
    })
    .catch(err => console.log(err))
}


// Withdraw an amount from user account 
function  withdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)) {
            return withdraw()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar?'
            }
        ])
        .then((answer) => {
            const amount = answer['amount']
            
            removeAmount(accountName, amount)
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if(!amount) {
        console.clear()
        console.log()
        console.log(chalk.bgRed.black('Ocorreu um erro! Tente novamente mais tarde.'))
        return withdraw()
    }

    if(accountData.balance < amount) {
        console.clear()
        console.log()
        console.log(chalk.bgRed.black('Saldo insuficiente!'))
        return withdraw()
    }
    
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        err => console.log(err)
    )
    
    console.clear()
    console.log()
    console.log(chalk.green(`Foi realizado um saque de R$${amount},00 na sua conta`))
    console.log()
    operation()
}