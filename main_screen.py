# main_screen.py
from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QPushButton, QStackedWidget, QLabel, QFrame, QSizePolicy
)
from PyQt5.QtCore import Qt
from configurator import Lab1, Lab2

class MainScreen(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Выбор лабораторной работы")
        self.resize(800, 600)

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.main_layout = QVBoxLayout()
        self.central_widget.setLayout(self.main_layout)

        # Центрированный заголовок
        self.title_label = QLabel("Лабораторные работы по курсу")
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setStyleSheet("font-size: 24px; font-weight: bold; color: #0D47A1;")
        self.main_layout.addWidget(self.title_label)

        # Контейнер для выбора лабораторных работ
        self.menu_container = QFrame()
        self.menu_container.setStyleSheet(
            "background-color: white; border: 2px solid #90CAF9; border-radius: 10px; padding: 20px;"
        )
        menu_layout = QVBoxLayout()
        self.menu_container.setLayout(menu_layout)

        self.lab1_button = QPushButton("Лабораторная работа 1: Парабола и корневые функции")
        self.lab1_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.lab1_button.clicked.connect(self.open_lab1)
        menu_layout.addWidget(self.lab1_button)

        self.lab2_button = QPushButton("Лабораторная работа 2: Синус и косинус")
        self.lab2_button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.lab2_button.clicked.connect(self.open_lab2)
        menu_layout.addWidget(self.lab2_button)

        self.main_layout.addWidget(self.menu_container)

        # QStackedWidget для отображения выбранной лабораторной работы
        self.lab_stack = QStackedWidget()
        self.main_layout.addWidget(self.lab_stack)

        # Создаем экземпляры лабораторных работ
        self.lab1 = Lab1()
        self.lab2 = Lab2()
        # Подключаем кнопку "Назад" для возврата к меню
        self.lab1.back_button.clicked.connect(self.show_main_menu)
        self.lab2.back_button.clicked.connect(self.show_main_menu)

        self.lab_stack.addWidget(self.lab1)
        self.lab_stack.addWidget(self.lab2)

        # Изначально отображаем меню выбора лабораторных работ, а область лабораторной работы скрыта
        self.lab_stack.setVisible(False)

    def open_lab1(self):
        self.lab_stack.setCurrentWidget(self.lab1)
        self.menu_container.setVisible(False)
        self.title_label.setVisible(False)
        self.lab_stack.setVisible(True)

    def open_lab2(self):
        self.lab_stack.setCurrentWidget(self.lab2)
        self.menu_container.setVisible(False)
        self.title_label.setVisible(False)
        self.lab_stack.setVisible(True)

    def show_main_menu(self):
        self.lab_stack.setVisible(False)
        self.menu_container.setVisible(True)
        self.title_label.setVisible(True)

if __name__ == "__main__":
    import sys
    from PyQt5.QtWidgets import QApplication
    app = QApplication(sys.argv)
    window = MainScreen()
    window.show()
    sys.exit(app.exec_())
