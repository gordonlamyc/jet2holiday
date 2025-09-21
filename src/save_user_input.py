import boto3
from datetime import datetime

def save_user_input():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('LegalDocuments')
    
    # Get user input
    documents_id = input("Documents ID: ")
    clause_id = input("Clause ID: ")
    clause_category = input("Clause Category: ")
    clause_risk_level = input("Clause Risk Level: ")
    clause_summary = input("Clause Summary: ")
    clause_text = input("Clause Text: ")
    clause_title = input("Clause Title: ")
    document_name = input("Document Name: ")
    document_type = input("Document Type: ")
    uploaded_by = input("Uploaded By: ")
    
    # Create item
    item = {
        'documentsID': documents_id,
        'clauseID': clause_id,
        'clauseCategory': clause_category,
        'clauseRiskLevel': clause_risk_level,
        'clauseSummary': clause_summary,
        'clauseText': clause_text,
        'clauseTitle': clause_title,
        'documentName': document_name,
        'documentType': document_type,
        'uploadedBy': uploaded_by,
        'uploadedDate': datetime.now().strftime('%Y-%m-%d'),
        'flagged': False,
        'language': 'en'
    }
    
    # Save to DynamoDB
    table.put_item(Item=item)
    print("Data saved successfully!")

if __name__ == "__main__":
    save_user_input()