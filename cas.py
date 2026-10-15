from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests


# Start a session
session = requests.Session()

driver = webdriver.Chrome()


# URL for the initial login (using reqres.in mock service)
login_url = "https://cas.unicaen.fr/login?service=https%3A%2F%2Fwebmail.unicaen.fr%2Fpublic%2Fpreauth-unicaen-fr.jsp"
driver.get(login_url)

login_payload = {
    "username": "USERNAME",
    "password": "PASSWORD"
}

liste_char=["A","B","C","D","E","F","G","H","1","2","3","4","5","6","7","8"]


login_grid={
    "A1": "",
    "A2": "",
    "A3": "",
	"A4": "",
    "A5": "",
	"A6": "",
	"A7": "",
	"A8": "",
    "B1": "",
    "B2": "",
    "B3": "",
	"B4": "",
    "B5": "",
	"B6": "",
	"B7": "",
    "B8": "",
    "C1": "",
    "C2": "",
    "C3": "",
    "C4": "",
    "C5": "",
    "C6": "",
    "C7": "",
    "C8": "",
    "D1": "",
    "D2": "",
    "D3": "",
    "D4": "",
    "D5": "",
    "D6": "",
    "D7": "",
    "D8": "",
    "E1": "",
    "E2": "",
    "E3": "",
    "E4": "",
    "E5": "",
    "E6": "",
    "E7": "",
    "E8": "",
    "F1": "",
    "F2": "",
    "F3": "",
    "F4": "",
    "F5": "",
    "F6": "",
    "F7": "",
    "F8": "",
    "G1": "",
    "G2": "",
    "G3": "",
    "G4": "",
    "G5": "",
    "G6": "",
    "G7": "",
    "G8": "",
    "H1": "",
    "H2": "",
    "H3": "",
    "H4": "",
    "H5": "",
    "H6": "",
    "H7": "",
    "H8": "",
}



def login(login_url):

    username = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "username")) # Adaptez le By.ID / By.NAME selon votre code
    )

    password = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "password"))  # Adaptez le By.ID ou By.NAME
    )

    seconnecter = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "submitBtn"))  # Adaptez le By.ID ou By.NAME
    )

    seconnecter=driver.find_element(By.ID, "submitBtn")
    
    username=driver.find_element(By.ID, "username")
    
    password=driver.find_element(By.ID, "password")

    
    username.send_keys(login_payload["username"])

    password.send_keys(login_payload["password"])

    seconnecter.click()
   
    
    global new_login_url
    new_login_url = driver.current_url





def access_second_auth(login_url):


    lien_partiel = driver.find_element(By.PARTIAL_LINK_TEXT, "Saisir le code indiqué")

    lien_partiel.click()
    
    global new_login_url
    new_login_url = driver.current_url


def access_third_auth(login_url):


    combi = []

    def text_not_empty(driver):
        try:
            element = driver.find_element(By.ID, "code_label")
            text = element.text.strip()
            return element if len(text) > 5 else False # S'assure qu'une phrase complète est chargée
        except:
            return False

    code_label = WebDriverWait(driver, 10).until(text_not_empty)

    print(code_label.text)
    for char in liste_char:
        if str(char) in code_label.text:
            combi.append(char)

    str(combi)
    print(combi)

    
    token =WebDriverWait(driver, 10).until(
         
        EC.presence_of_element_located((By.ID, "token"))
    )

    token=driver.find_element(By.ID,"token")

    print(combi)
    
    token.send_keys(login_grid[combi[0]+combi[1]])

    input(" press enter to quit ")
    driver.quit()
     
def main() -> None:


    login(login_url)

    try:
    
        WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, "Saisir le code indiqué"))
        )
        print("-> Étape intermédiaire détectée, exécution de access_second_auth.")
        access_second_auth(new_login_url)
        
    except:
        # Si le lien n'est pas présent au bout de 5 secondes, on le zappe
        print("-> Pas d'étape intermédiaire, passage direct à access_third_auth.")

    
    access_third_auth(new_login_url)


if __name__ == "__main__":
	main()
