# ML Pipeline

The target pipeline is Data Loader -> Preprocessor -> Feature Generator -> Splitter -> Trainer -> Evaluator -> Model Registry -> Prediction Service.

The registry should support Logistic Regression, Random Forest, SVM, Gradient Boosting, and Neural Network adapters without coupling the UI to one model. Evaluation should include accuracy, precision, recall, F1, ROC-AUC, PR-AUC, and confusion matrix where appropriate. No model or accuracy number is claimed in the current UI.
