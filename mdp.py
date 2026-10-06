from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests
import pathlib

# Start a session
session = requests.Session()

driver = webdriver.Chrome()


# URL for the initial login (using reqres.in mock service)
login_url = "https://webmail.unicaen.fr"

driver.get(login_url)

# Payload for the initial login request
login_payload = {
    "username": "USERNAME",
    "password": "PASSWORD"
}

liste_char=["A","B","C","D","E","F","G","H","1","2","3","4","5","6","7","8"]


login_grid={
    "A1": "779853",
    "A2": "779854",
    "A3": "779855",
	"A4": "779856",
    "A5": "779857",
	"A6": "779858",
	"A7": "779859",
	"A8": "779860",
    "B1": "779861",
    "B2": "779862",
    "B3": "779863",
	"B4": "779864",
    "B5": "779865",
	"B6": "779866",
	"B7": "779867",
    "B8": "779868",
		
}

combi = []
# Initial login request
seconnecter=driver.find_element(By.ID, "submitBtn")
username=driver.find_element(By.ID, "username")
password=driver.find_element(By.ID, "password")



def login():

    username = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "username")) # Adaptez le By.ID / By.NAME selon votre code
    )

    password = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "password"))  # Adaptez le By.ID ou By.NAME
    )

    seconnecter = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "submitBtn"))  # Adaptez le By.ID ou By.NAME
    )



    
    username.send_keys(login_payload["username"])

    password.send_keys(login_payload["password"])

    seconnecter.click()
	
   
    
    global login_url
    login_url = driver.current_url





def access_second_auth():

    lien_partiel = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, "Saisir le code indiqué"))
    )
    lien_partiel.click()

    global login_url
    login_url = driver.current_url


def access_third_auth():

    code_label=driver.find_element(By.ID,"code_label").get_attribute("textContent")
    code_label =WebDriverWait(driver, 10).until(
         
        EC.presence_of_element_located((By.ID, "code_label"))
    )
    print(code_label.text)
    for char in liste_char:
        if str(char) in code_label.text:
            combi.append(char)

    str(combi)
    print(combi)

    input(" press enter to quit ")
    driver.quit()
     
def main() -> None:

    driver.get(login_url)

    login()

    access_second_auth()

    

    access_third_auth()


if __name__ == "__main__":
	main()



