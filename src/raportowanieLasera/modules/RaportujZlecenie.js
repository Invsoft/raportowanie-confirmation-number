class RaportujZlecenie {
    constructor() {
        this.scanInput = ''
        this.employeeId = -1
        this.employee = {}
        this.orderProductionSystemObject = {}
        this.productOrComponentSystemObject = {}
        this.operacja = {}
        this.pracePracownika = []
    }

    setter = (changes) => {
        Object.keys(changes).forEach(key => {
            console.log('RaportujZlecenie.setter(' + key + ', ' + changes[key] + ')')

            this[key] = changes[key]
        })
        return this
    }

    getEmployeeFulname = () => {
        return this.employee.surname ? this.employee.surname + ' ' + this.employee.name : ''
    }

    isPracownikOdczytany = () => {
        return this.employee.id
    }

    isZlecenieOdczytane = () => {
        return this.orderProductionSystemObject.id_system_object
    }

    zlecenieOpis = () => {
        return this.orderProductionSystemObject.id_system_object 
        ? this.orderProductionSystemObject.object_index + ' / ' + this.orderProductionSystemObject.title 
        : ''
    }

    wyslijNaSerwer = (additionalFields, promiseHandler, errorHandler) => {
        const doWyslania = Object.assign({ ...this }, { ...additionalFields })
        doWyslania.idEmployee = this.employee.id
        delete doWyslania.employee

        delete doWyslania.obiektyTestowe
        delete doWyslania.pracePracownika
        delete doWyslania.serverInfo

        doWyslania.idZlecenie = this.orderProductionSystemObject.id_system_object
        delete doWyslania.orderProductionSystemObject
        doWyslania.idElement = this.productOrComponentSystemObject.id_system_object
        delete doWyslania.productOrComponentSystemObject

        const doWyslaniaJson = JSON.stringify(doWyslania)

        fetch('/eoffice/production/raportowanie_pracy_zlecenia/raportowanie_pracy_zlecenia_json_endpoint.xml?action=analizuj_skan_kodu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' //'Content-Type': 'application/json' 
            },
            body: 'raportujZlecenieBody=' + doWyslaniaJson
        })
            .then(response => {
                if (!response.ok) {
                    return Promise.reject();
                }
                return response.json()
            })
            .then(json => {
                if (json.is_request_successful === false) {
                    const error_message = json.error_message
                    const errorCause = json.cause
                    this.errorCause = json.cause
                    return Promise.reject({ error_message, errorCause })
                }
                const fromServer = json
                console.log('RaportujZlecenie.wyslijNaSerwer fromServer', fromServer)
                fromServer.idEmployee = fromServer.employee ? fromServer.employee.id : ''
                fromServer.idProgramu = fromServer.kartaProgramu ? fromServer.kartaProgramu.idProgramu : ''
                this.pracePracownika = fromServer.pracePracownika

                // this.employee = fromServer.employee
                // this.idEmployee = fromServer.employee ? fromServer.employee.id : ''
                // this.idProgramu = fromServer.kartaProgramu ? fromServer.kartaProgramu.idProgramu : ''
                // this.kartaProgramu = fromServer.kartaProgramu
                // this.serverInfo = fromServer.serverInfo

                promiseHandler(fromServer)
            })
            .catch(error => errorHandler(error))
    }
}

export default RaportujZlecenie